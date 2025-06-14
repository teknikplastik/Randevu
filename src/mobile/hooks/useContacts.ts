import { useState, useEffect } from 'react'
import { Contacts } from '@capacitor/contacts'

interface Contact {
  id: string
  name: string
  phone: string
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  const requestPermission = async () => {
    try {
      const permission = await Contacts.requestPermissions()
      setHasPermission(permission.contacts === 'granted')
      return permission.contacts === 'granted'
    } catch (error) {
      console.error('Permission error:', error)
      return false
    }
  }

  const loadContacts = async () => {
    setLoading(true)
    try {
      if (!hasPermission) {
        const granted = await requestPermission()
        if (!granted) {
          setLoading(false)
          return
        }
      }

      const result = await Contacts.getContacts({
        projection: {
          name: true,
          phones: true
        }
      })

      const formattedContacts: Contact[] = result.contacts
        .filter(contact => contact.name && contact.phones && contact.phones.length > 0)
        .map(contact => ({
          id: contact.contactId || Math.random().toString(),
          name: contact.name?.display || 'Bilinmeyen',
          phone: contact.phones?.[0]?.number?.replace(/\D/g, '').slice(-10) || ''
        }))
        .filter(contact => contact.phone.length === 10)

      setContacts(formattedContacts)
    } catch (error) {
      console.error('Error loading contacts:', error)
      // Fallback to mock data for development
      setContacts([
        { id: '1', name: 'Ahmet Yılmaz', phone: '5321234567' },
        { id: '2', name: 'Ayşe Demir', phone: '5339876543' },
        { id: '3', name: 'Mehmet Kaya', phone: '5445556677' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  return {
    contacts,
    loading,
    hasPermission,
    requestPermission,
    loadContacts
  }
}