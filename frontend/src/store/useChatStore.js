import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import { axiosInstance } from '../lib/axios'
import { useAuthStore } from './useAuthStore'

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true })
        try {
            const res = await axiosInstance.get("/message/users");
            set({ users: res.data.filteredUsers || [] })

        } catch (error) {
            console.log("Error while getting users", error)
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const res = await axiosInstance.get(`/message/${userId}`);
            set({ messages: res.data.messages })
        } catch (error) {
            console.log("Error while getting messages", error)
            toast.error(error.response.data.message)
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (data) => {
        const { selectedUser, messages } = get()
        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, data)
            set({ messages: [...messages, res.data.newMessage] })
        } catch (error) {
            console.log("Error while sending message", error)
            toast.error(error.response.data.message)
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser)
            return
        const socket = useAuthStore.getState().socket;

        socket.on('newMessage', (newMessage) => {
            if(newMessage.senderId!=selectedUser._id)
                return;
            set({
                messages: [...get().messages, newMessage]
            })
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket
        socket.off("newMessage")
    },

    setSelectedUser: (selectedUser) => set({ selectedUser })
}))