<template>
  <div id="debug-tab">
    <p>
      This page contains internal debug information for this installation of
      Zettlr.
    </p>
    <h2>General Information</h2>
    <p>Zettlr Version: <strong>{{ version }}</strong> (UUID: {{ uuid }})</p>
    <p>
      System: <strong>{{ platform }} {{ platformVersion }}</strong>
      (architecture: {{ arch }})
    </p>
    <h2>Build Dependencies</h2>
    <p>
      This build was compiled using
      <ul>
        <li>Node.js <strong>v{{ versions.node }}</strong></li>
        <li>Electron <strong>v{{ versions.electron }}</strong></li>
        <li>Chrome <strong>v{{ versions.chrome }}</strong></li>
        <li>v8 engine <strong>v{{ versions.v8 }}</strong></li>
        <li>Zlib <strong>v{{ versions.zlib }}</strong></li>
        <li>OpenSSL <strong>v{{ versions.openssl }}</strong></li>
      </ul>
    </p>
    <h2>Renderer flags</h2>
    <ul>
      <li v-for="(arg, idx) in argv" v-bind:key="idx">
        {{ arg }}
      </li>
    </ul>
    <h2>Environment Variables</h2>
    <ul>
      <li v-for="(key, value, idx) in env" v-bind:key="idx">
        <strong>{{ value }}</strong>: {{ key }}
      </li>
    </ul>
  </div>
</template>

<script>
/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        DebugTab
 * CVM-Role:        View
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     This file contains the debug tab for the about window.
 *
 * END HEADER
 */

export default {
  name: 'DebugTab',
  data: function () {
    console.log(process)
    return {
      version: global.config.get('version'),
      uuid: global.config.get('uuid'),
      versions: process.versions,
      argv: process.argv,
      arch: process.arch,
      env: Object.assign({}, process.env),
      platform: process.platform,
      platformVersion: process.getSystemVersion
    }
  },
  methods: {
  }
}
</script>

<style lang="less">
div#debug-tab {
  user-select: text;
  * {
    margin: revert;
  }
}
</style>
