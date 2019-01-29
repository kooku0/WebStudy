
<template>
    <div class="wrap">
      <div class="page full_page chat_page layout">
        <Nav/>
        <router-view/>
      </div>
    </div>
</template>

<script>
import Nav from './components/Nav'

export default {
  name: 'App',
  components: {
    'Nav': Nav
  }
}
</script>
