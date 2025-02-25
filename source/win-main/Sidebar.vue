<template>
  <div id="sidebar">
    <div id="sidebar-tabs" role="tablist">
      <button
        role="tab"
        v-bind:aria-label="tocLabel"
        data-target="sidebar-toc"
        v-bind:class="{
          'sidebar-tab': true,
          'active': currentTab === 'toc'
        }"
        v-bind:title="tocLabel"
        v-on:click="currentTab = 'toc'"
      >
        <clr-icon shape="indented-view-list" role="presentation"></clr-icon>
      </button>
      <button
        role="tab"
        v-bind:aria-label="referencesLabel"
        data-target="sidebar-bibliography"
        v-bind:class="{
          'sidebar-tab': true,
          'active': currentTab === 'references'
        }"
        v-bind:title="referencesLabel"
        v-on:click="currentTab = 'references'"
      >
        <clr-icon shape="book" role="presentation"></clr-icon>
      </button>
      <button
        role="tab"
        v-bind:aria-label="relatedFilesLabel"
        data-target="sidebar-related-files"
        v-bind:class="{
          'sidebar-tab': true,
          'active': currentTab === 'relatedFiles'
        }"
        v-bind:title="relatedFilesLabel"
        v-on:click="currentTab = 'relatedFiles'"
      >
        <clr-icon shape="file-group" role="presentation"></clr-icon>
      </button>
      <button
        role="tab"
        v-bind:aria-label="attachmentsLabel"
        data-target="sidebar-files"
        v-bind:class="{
          'sidebar-tab': true,
          'active': currentTab === 'attachments'
        }"
        v-bind:title="attachmentsLabel"
        v-on:click="currentTab = 'attachments'"
      >
        <clr-icon shape="attachment" role="presentation"></clr-icon>
      </button>
    </div>

    <!-- Now the tab containers -->

    <div
      v-show="currentTab === 'relatedFiles'"
      role="tabpanel"
    >
      <h1>Related files</h1>
      <div v-if="relatedFiles.length === 0" class="related-files-container">
        No related files.
      </div>
      <div v-else class="related-files-container">
        <div
          v-for="fileRecord, idx in relatedFiles"
          v-bind:key="idx"
          class="related-file"
        >
          <span
            class="filename"
            draggable="true"
            v-on:mousedown.stop="requestFile($event, fileRecord.path)"
            v-on:dragstart="beginDragRelatedFile($event, fileRecord.path)"
          >{{ getRelatedFileName(fileRecord.path) }}</span>
          <span
            v-for="tag, idx2 in fileRecord.tags"
            v-bind:key="idx2"
            class="tag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-show="currentTab === 'attachments'"
      role="tabpanel"
    >
      <!-- Other files contents -->
      <h1>
        {{ attachmentsLabel }}
        <clr-icon
          id="open-dir-external"
          v-bind:title="openDirLabel"
          shape="folder"
          class="is-solid"
        ></clr-icon>
      </h1>

      <!-- Render all attachments -->
      <p v-if="attachments.length === 0">
        {{ noAttachmentsMessage }}
      </p>
      <template v-else>
        <a
          v-for="(attachment, idx) in attachments"
          v-bind:key="idx"
          class="attachment"
          draggable="true"
          v-bind:data-link="attachment.path"
          v-bind:data-hash="attachment.hash"
          v-bind:title="attachment.path"
          v-bind:href="`safe-file://${attachment.path}`"
          v-on:dragstart="handleDragStart($event, attachment.path)"
        >
          <span v-html="getIcon(attachment.path)"></span>
          {{ attachment.name }}
        </a>
      </template>
    </div>
    <div
      v-show="currentTab === 'references'"
      role="tabpanel"
    >
      <!-- References -->
      <h1>{{ referencesLabel }}</h1>
      <div v-html="referenceHTML">
        <!-- Will contain the actual HTML -->
      </div>
    </div>
    <div
      v-show="currentTab === 'toc'"
      role="tabpanel"
    >
      <!-- Table of Contents -->
      <h1>{{ tocLabel }}</h1>
      <!-- Show the ToC entries -->
      <div
        v-for="(entry, idx) of tableOfContents"
        v-bind:key="idx"
        class="toc-entry-container"
        v-bind:style="{
          'margin-left': `${entry.level * 10}px`
        }"
        v-on:click="$root.$emit('toc-line', entry.line)"
      >
        <div class="toc-level">
          {{ entry.renderedLevel }}
        </div>
        <div class="toc-entry" v-bind:data-line="entry.line" v-html="entry.text"></div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        Sidebar
 * CVM-Role:        View
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     This component renders the sidebar.
 *
 * END HEADER
 */

import { trans } from '../common/i18n-renderer'
import { ClarityIcons } from '@clr/icons'

const path = window.path
const ipcRenderer = window.ipc

const FILETYPES_IMG = [
  '.jpg',
  '.jpeg',
  '.svg',
  '.gif',
  '.png',
  '.tiff',
  '.tif'
]

export default {
  name: 'Sidebar',
  props: {
  },
  data: function () {
    return {
      currentTab: 'toc',
      bibContents: undefined,
      relatedFiles: []
    }
  },
  computed: {
    attachmentsLabel: function () {
      return trans('gui.attachments')
    },
    referencesLabel: function () {
      return trans('gui.citeproc.references_heading')
    },
    tocLabel: function () {
      return trans('gui.table_of_contents')
    },
    relatedFilesLabel: function () {
      return 'Related Files' // TODO: Translate!
    },
    openDirLabel: function () {
      return trans('gui.attachments_open_dir')
    },
    noAttachmentsMessage: function () {
      return trans('gui.no_attachments')
    },
    attachments: function () {
      const currentDir = this.$store.state.selectedDirectory
      if (currentDir === null) {
        return []
      } else {
        return currentDir.attachments
      }
    },
    activeFile: function () {
      return this.$store.state.activeFile
    },
    tableOfContents: function () {
      return this.$store.state.tableOfContents
    },
    citationKeys: function () {
      return this.$store.state.citationKeys
    },
    referenceHTML: function () {
      if (this.bibContents === undefined || this.bibContents[1].length === 0) {
        return `<p>${trans('gui.citeproc.references_none')}</p>`
      } else {
        const html = [this.bibContents[0].bibstart]

        for (const entry of this.bibContents[1]) {
          html.push(entry)
        }

        html.push(this.bibContents[0].bibend)

        return html.join('\n')
      }
    }
  },
  watch: {
    citationKeys: function () {
      // Reload the bibliography
      ipcRenderer.invoke('citeproc-provider', {
        command: 'get-bibliography',
        payload: this.citationKeys
      })
        .then(bibliography => {
          this.bibContents = bibliography
        })
        .catch(err => console.error(err))
    },
    activeFile: function () {
      if (this.activeFile === null) {
        this.relatedFiles = []
        return
      }

      if (this.activeFile.type !== 'file') {
        this.relatedFiles = []
        return
      }

      ipcRenderer.invoke('tag-provider', {
        command: 'recommend-matching-files',
        payload: this.activeFile.tags
      })
        .then(recommendations => {
          // Recommendations come in the form of [file: string]: string[]
          this.relatedFiles = []
          for (const filePath of Object.keys(recommendations)) {
            this.relatedFiles.push({
              file: path.basename(filePath),
              path: filePath,
              tags: recommendations[filePath]
            })
          }

          this.relatedFiles.sort((a, b) => {
            return b.tags.length - a.tags.length
          })
        })
        .catch(err => console.error(err))
    }
  },
  mounted: function () {
    ipcRenderer.on('citeproc-renderer', (event, { command, payload }) => {
      if (command === 'citeproc-bibliography') {
        this.bibContents = payload
      }
    })
  },
  methods: {
    getIcon: function (attachmentPath) {
      const fileExtIcon = ClarityIcons.get('file-ext')
      if (typeof fileExtIcon === 'string') {
        return fileExtIcon.replace('EXT', path.extname(attachmentPath).slice(1, 4))
      } else {
        return ''
      }
    },
    handleDragStart: function (event, attachmentPath) {
      // When dragging files from here onto the editor instance, users want
      // to have the appropriate link placed automatically, that is: images
      // should be wrapped in appropriate image tags, whereas documents
      // should be linked to enable click & open. We have to do this on
      // this end, because when trying to override data during drop it
      // won't work.
      const ext = path.extname(attachmentPath).toLowerCase()
      const basename = path.basename(attachmentPath)
      const uri = decodeURIComponent(attachmentPath)
      const data = FILETYPES_IMG.includes(ext) ? `![${basename}](${uri})` : `[${basename}](${uri})`
      event.dataTransfer.setData('text', data)
    },
    requestFile: function (event, filePath) {
      ipcRenderer.invoke('application', {
        command: 'open-file',
        payload: {
          path: filePath,
          newTab: event.type === 'mousedown' && event.button === 1
        }
      })
        .catch(e => console.error(e))
    },
    getRelatedFileName: function (filePath) {
      const descriptor = this.$store.getters.file(filePath)
      if (descriptor === null) {
        return filePath
      }

      if (descriptor.frontmatter !== null && 'title' in descriptor.frontmatter) {
        return descriptor.frontmatter.title
      } else if (descriptor.firstHeading !== null && Boolean(this.$store.state.config['display.useFirstHeadings'])) {
        return descriptor.firstHeading
      } else {
        return descriptor.name.replace(descriptor.ext, '')
      }
    },
    beginDragRelatedFile: function (event, filePath) {
      const descriptor = this.$store.getters.file(filePath)

      event.dataTransfer.setData('text/x-zettlr-file', JSON.stringify({
        'type': descriptor.type, // Can be file, code, or directory
        'path': descriptor.path,
        'id': descriptor.id // Convenience
      }))
    }
  }
}
</script>

<style lang="less">
body {
  @button-margin: 5px;
  @border-radius: 5px;
  @button-size: 5px;
  @button-icon-size: 5px;

  #sidebar {
    background-color: rgb(230, 230, 230);
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    // Enable tabs
    #sidebar-tabs {
      display: flex;
      justify-content: space-evenly;

      .sidebar-tab {
        flex-grow: 1;
        text-align: center;
      }
    }

    #open-dir-external {
        padding: @button-margin;
        border-radius: @border-radius;
        display: inline-block;
        width: @button-size;
        height: @button-size;

        clr-icon {
            width: @button-icon-size;
            height: @button-icon-size;
        }
    }

    h1 {
        padding: 10px;
        font-size: 16px;
    }

    p { padding: 10px; }

    a.attachment {
      display: block;
      margin: 10px;
      padding: 4px;
      text-decoration: none;
      color: inherit;
      // Padding 4px + 4px margin + 24px icon width = 32px
      text-indent: -32px;
      padding-left: 32px;
      // Some filenames are too long for the sidebar. However, unlike with the
      // file manager where we have the full filename visible in multiple places,
      // here we must make sure the filename is fully visible. Hence, we don't
      // use white-space: nowrap, but rather word-break: break-all.
      word-break: break-all;

      svg {
        width: 24px;
        height: 24px;
        margin-right: 4px;
        vertical-align: bottom;
        margin-bottom: -1px;
        // Necessary to give the extension icons the correct colour
        fill: currentColor;
      }
    }

    // Bibliography entries
    div.csl-bib-body {
      div.csl-entry {
        display: list-item;
        list-style-type: square;
        margin: 1em 0.2em 1em 1.8em;
        font-size: 80%;
        user-select: text;
        cursor: text;
      }

      a { color: var(--blue-0); }
    }

    // Table of Contents entries
    div.toc-entry-container {
      // Clever calculation based on the data-level property
      // margin-left: calc(attr(data-level) * 10px);
      display: flex;
      margin-bottom: 10px;

      div.toc-level {
        flex-shrink: 1;
        padding: 0px 5px;
        font-weight: bold;
        color: var(--system-accent-color, --c-primary);
      }

      div.toc-entry {
        flex-grow: 3;
        cursor: pointer;
        &:hover { text-decoration: underline; }
      }
    }

    div.related-files-container {
      padding: 10px;

      div.related-file {
        margin-bottom: 10px;

        span.filename {
          display: block;
          font-size: 11px;
          padding: 10px 5px;

          &:hover {
            background-color: rgb(200, 200, 200);
          }
        }

        span.tag {
          font-size: 10px;
          display: inline-block;
          border-radius: 4px;
          padding: 2px;
        }
      }
    }
  }

  &.dark {
    #sidebar {
      background-color: rgba(30, 30, 30, 1);
      color: rgb(230, 230, 230);

      div.related-files-container {
        div.related-file {
          span.filename:hover { background-color: rgb(80, 80, 80); }
        }
      }
    }
  }
}

body.darwin div#sidebar {
  // On macOS the toolbar is 40px high and the documents titlebar is 30px high,
  // so we want to offset the sidebar by that.
  top: calc(40px + 30px);

  div.related-files-container {
    div.related-file span.filename { border-radius: 4px; }
  }

  #sidebar-tabs {
    justify-content: space-around;
    padding: 10px 20px 0px 20px;

    .sidebar-tab {
      &.active { background-color: rgb(230, 230, 230); }

      &:not(:first-child) {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
        border-left: 0px; // We only want 1px border between the buttons
      }

      &:not(:last-child) {
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
      }
    }
  }
}

body.darwin.dark div#sidebar {
  #sidebar-tabs .sidebar-tab {
    &.active { background-color: rgb(120, 120, 120); }

    &:not(:last-child) {
      // We need a border here
      border-right: 1px solid rgb(120, 120, 120);
    }
  }
}

body.win32 {

  #sidebar #sidebar-tabs .sidebar-tab.active {
    background-color: rgb(230, 230, 230);
  }

  &.dark #sidebar #sidebar-tabs .sidebar-tab.active {
    background-color: rgb(120, 120, 120);
  }
}
</style>
