import Vue from 'vue'
import Router from 'vue-router'
import Chat from '@/components/Chat'
import Member from '@/components/Member'
import Message from '@/components/Message'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/Chat',
      name: 'Chat',
      component: Chat
    },
    {
      path: '/Member',
      name: 'Member',
      component: Member
    },
    {
      path: '/Message',
      name: 'Message',
      component: Message
    }
  ]
})
