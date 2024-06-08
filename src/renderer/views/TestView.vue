<template>
    <div>
        <h1>Test View</h1>
    </div>
  </template>
  
  <script lang="ts">
    import Vue from 'vue'
    // import { ipcRenderer } from 'electron';
    // const { ipcRenderer } = window
  
    export default Vue.extend({
      name: 'TestView',
      mounted() {
        // window.ipcRenderer.emit("test-channel")
        console.log(window)
      },
    })
  </script>