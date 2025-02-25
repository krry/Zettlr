<template>
  <div id="contributors-tab">
    <div v-for="(translation, idx) in translationMetadata" v-bind:key="idx">
      <h3>
        {{ getLocalisedTranslationName(translation.bcp47) }}
        <small>
          last updated {{ formattedDate(translation.updated_at) }}
        </small>
      </h3>
      <ul>
        <li v-for="author in translation.authors" v-bind:key="author.name">
          {{ author.name }}
          <template v-if="author.email">
            (<a v-bind:href="linkifyEmail(author.email)">{{ author.email }}</a>)
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        ContributorsTab
 * CVM-Role:        View
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     The contributors tab inside the about window
 *
 * END HEADER
 */

import { trans } from '../common/i18n-renderer'
import formatDate from '../common/util/format-date'
const ipcRenderer = window.ipc

export default {
  name: 'ContributorsTab',
  data: function () {
    return {
      translationMetadata: []
    }
  },
  created: function () {
    // Retrieve the translation metadata
    ipcRenderer.invoke('translation-provider', { command: 'get-translation-metadata' })
      .then(data => {
        this.translationMetadata = data

        // Before actually returning, make sure to resolve the author names which
        // may contain email addresses.
        for (const translation of this.translationMetadata) {
          translation.authors = translation.authors.map(author => {
            const match = /(.+)<(.+)>/.exec(author)
            if (match !== null) {
              return {
                name: match[1].trim(),
                email: match[2].trim()
              }
            } else {
              return {
                name: author
              }
            }
          })
        }

        console.log(this.translationMetadata)
      })
      .catch(e => console.error(e))
  },
  methods: {
    getLocalisedTranslationName: function (bcp47) {
      const failsafe = 'dialog.preferences.app_lang.' + bcp47
      const name = trans(failsafe)
      // Return the translation name, but if there is none, just return the
      // BCP-47 tag name.
      if (name === failsafe) {
        return bcp47
      } else {
        return name
      }
    },
    formattedDate: function (dateString) {
      return formatDate(new Date(dateString))
    },
    linkifyEmail: function (email) {
      return `mailto:${email}`
    }
  }
}
</script>

<style lang="less">
div#contributors-tab * {
  margin: revert;
}
</style>
