import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { CalendarEvent, Holiday } from '@/types/database'
import { useToast } from '@/contexts/ToastContext'

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) throw error
      setEvents((data || []) as CalendarEvent[])
    } catch (err) {
      console.error('Error fetching events:', err)
      addToast('error', 'Failed to load calendar events')
    }
  }, [addToast])

  const fetchHolidays = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setHolidays((data || []) as Holiday[])
    } catch (err) {
      console.error('Error fetching holidays:', err)
    }
  }, [])

  const addEvent = async (event: Partial<CalendarEvent>) => {
    try {
      const { error } = await supabase.from('calendar_events').insert(event)
      if (error) throw error
      addToast('success', 'Event created')
      fetchEvents()
    } catch (err) {
      console.error('Error adding event:', err)
      addToast('error', 'Failed to create event')
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from('calendar_events').delete().eq('id', id)
      if (error) throw error
      addToast('success', 'Event deleted')
      fetchEvents()
    } catch (err) {
      console.error('Error deleting event:', err)
      addToast('error', 'Failed to delete event')
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchEvents(), fetchHolidays()])
      .finally(() => setLoading(false))
  }, [fetchEvents, fetchHolidays])

  return { events, holidays, loading, fetchEvents, addEvent, deleteEvent }
}
