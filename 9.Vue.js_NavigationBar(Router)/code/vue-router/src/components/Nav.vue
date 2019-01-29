<template>
  <!-- nav -->
    <nav class="nav">
        <ul>
            <router-link tag='li' to="/chat">
                <div class="menu_icon">
                    <img src="../images/icon_chat.png">
                </div>
                <div class="menu">채팅</div>
            </router-link>
            <router-link tag='li' to="/member" exact>
                <div class="menu_icon">
                    <img src="../images/icon_member.png">
                </div>
                <div class="menu">맴버</div>
            </router-link>
            <router-link tag='li' to="/message" exact>
                <div class="menu_icon">
                    <img src="../images/icon_message.png">
                </div>
                <div class="menu">메시지</div>
            </router-link>
        </ul>
    </nav>
</template>

<script>
export default {
  name: 'Nav',
  data () {
    return {
      active: 'home'
    }
  }
}
</script>

<style>
    ul{ list-style:none;}
    .nav{top:0;left:0;width:150px;height:100%;background:#3B46AB;box-shadow: 2px 1px 10px 0 rgba(38,44,103,0.32);z-index:50;}
    .nav > ul > li{position:relative;height:74px;border-bottom:1px solid #4D57B2;text-align:center;}
    .nav > ul > li > a{}
    .nav > ul > li .menu{font-size:13px;color:#7B84D6;padding-top:4px;}
    .nav > ul > li .menu_icon img{width:20px;height:20px;padding-top:16px;}
    nav li.router-link-exact-active .menu{
        color: white;
    }
    nav li.router-link-exact-active .menu_icon {
        filter: brightness(1.8);
    }
</style>
