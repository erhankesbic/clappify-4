"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ChevronLeft, ChevronRight, Search, Plus, Trash2, Edit, X } from 'lucide-react'
import  Button  from "@/components/ui/Button"
import  Input  from "@/components/ui/Input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Define interfaces for our data structures
interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  calendar_id: string;
  calendars?: {
    id: string;
    color: string;
  };
}

interface Calendar {
  id: string;
  name: string;
  color: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [events, setEvents] = useState<Event[]>([])
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([])
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    fetchCalendars()
    fetchEvents().then(setEvents)
  }, [currentDate, view, selectedCalendars])

  const fetchCalendars = async () => {
    const { data, error } = await supabase.from('calendars').select('*')
    if (error) console.error('Error fetching calendars:', error)
    else setCalendars(data as Calendar[])
  }

  const fetchEvents = async (): Promise<Event[]> => {
    let startDate: Date, endDate: Date;
    
    switch (view) {
      case 'day':
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        endDate = new Date(currentDate.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        break;
      case 'month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
        break;
      default:
        // Default to current day if view is not recognized
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        endDate = new Date(currentDate.setHours(23, 59, 59, 999));
    }

    const { data, error } = await supabase
      .from('events')
      .select('*, calendars(id, color)')
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .in('calendar_id', selectedCalendars.length > 0 ? selectedCalendars : [null]);

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    return data as Event[];
  }

  const handleEventSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const eventData = Object.fromEntries(formData)

    // Validate event data
    if (!eventData.title || !eventData.start_time || !eventData.end_time) {
        console.error('Please fill in all required fields.')
        return
    }

    // Ensure end time is after start time
    if (new Date(eventData.start_time as string) >= new Date(eventData.end_time as string)) {
        console.error('End time must be after start time.')
        return
    }

    if (currentEvent) {
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', currentEvent.id)

      if (error) console.error('Error updating event:', error)
      else {
        setCurrentEvent(null)
        const updatedEvents = await fetchEvents()
        setEvents(updatedEvents)
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert(eventData)

      if (error) console.error('Error creating event:', error)
      else {
        const updatedEvents = await fetchEvents()
        setEvents(updatedEvents)
      }
    }

    setIsEventDialogOpen(false)
  }

  const handleEventDelete = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) console.error('Error deleting event:', error)
    else {
      const updatedEvents = await fetchEvents()
      setEvents(updatedEvents)
    }
  }

  const handleCalendarSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const calendarData = Object.fromEntries(formData)

    const { error } = await supabase
      .from('calendars')
      .insert(calendarData)

    if (error) console.error('Error creating calendar:', error)
    else {
      fetchCalendars()
      setIsCalendarDialogOpen(false)
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7))
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1))
        break
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'prev' ? -1 : 1))
        break
    }
    setCurrentDate(newDate)
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  const closeEventDetails = () => {
    setSelectedEvent(null)
  }

  // Modify the event rendering in day, week, and month views
  const renderEvent = (event) => {
    if (!selectedCalendars.includes(event.calendar_id)) return null;
    return (
      <div 
        key={event.id} 
        className="text-white p-1 text-xs rounded cursor-pointer"
        style={{ backgroundColor: event.calendars?.color || '#3B82F6' }}
        onClick={() => handleEventClick(event)}
      >
        {event.title}
      </div>
    )
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return (
      <div className="grid grid-cols-1 gap-px bg-gray-700">
        {hours.map((hour) => (
          <div key={hour} className="relative h-16">
            <div className="absolute left-0 -mt-3 w-16 pr-2 text-right text-xs leading-5 text-gray-400">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            <div className="border-t border-gray-700 p-2 h-full">
              {events.filter(event => new Date(event.start_time).getHours() === hour).map(renderEvent)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderWeekView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return (
      <div className="grid grid-cols-8 gap-px bg-gray-700">
        <div className="col-span-1"></div>
        {weekDays.map((day, index) => (
          <div key={day} className="p-2 text-center font-semibold">
            {day} {new Date(currentDate.getTime() + index * 86400000).getDate()}
          </div>
        ))}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="p-2 text-right text-sm text-gray-400">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            {weekDays.map((_, dayIndex) => (
              <div key={dayIndex} className="border-t border-l border-gray-700 p-2 h-16">
                {events.filter(event => 
                  new Date(event.start_time).getHours() === hour &&
                  new Date(event.start_time).getDay() === dayIndex
                ).map(renderEvent)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    )
  }

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = Array.from({ length: 42 }, (_, i) => {
      const day = i - startingDay + 1
      return day > 0 && day <= daysInMonth ? day : null
    })

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-700">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center font-semibold">{day}</div>
        ))}
        {days.map((day, index) => (
          <div key={index} className={`p-2 h-24 ${day ? 'border border-gray-700' : ''}`}>
            {day && (
              <>
                <span className="text-sm">{day}</span>
                <div className="mt-1">
                  {events.filter(event => new Date(event.start_time).getDate() === day).map(renderEvent)}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderYearView = () => {
    return (
      <div className="grid grid-cols-4 gap-4">
        {months.map((month, index) => (
          <div key={month} className="p-4 border border-gray-700 rounded">
            <h3 className="font-semibold mb-2">{month}</h3>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {weekDays.map((day) => (
                <div key={day} className="text-center font-medium">{day.charAt(0)}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div key={day} className="text-center">{day}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const EventDetailsWindow = () => {
    if (!selectedEvent) return null

    // Funktion zum Formatieren des Datums für datetime-local Input
    const formatDateForInput = (dateString: string) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
            <Button variant="ghost" size="icon" onClick={closeEventDetails}><X /></Button>
          </div>
          <p className="mb-2">{selectedEvent.description}</p>
          <p className="mb-2">
            Start: {new Date(selectedEvent.start_time).toLocaleString()}
          </p>
          <p className="mb-4">
            End: {new Date(selectedEvent.end_time).toLocaleString()}
          </p>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => {
              setCurrentEvent({
                ...selectedEvent,
                start_time: formatDateForInput(selectedEvent.start_time),
                end_time: formatDateForInput(selectedEvent.end_time)
              })
              setIsEventDialogOpen(true)
              closeEventDetails()
            }}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => {
              handleEventDelete(selectedEvent.id)
              closeEventDetails()
            }}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setIsEventDialogOpen(true)}><Plus /></Button>
          <h1 className="text-2xl font-bold">
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" onClick={() => navigateDate('prev')}><ChevronLeft /></Button>
          <Button variant="ghost" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="ghost" onClick={() => navigateDate('next')}><ChevronRight /></Button>
        </div>
        <div className="flex space-x-2">
          {['Day', 'Week', 'Month', 'Year'].map((v) => (
            <Button
              key={v}
              variant={view === v.toLowerCase() ? "secondary" : "ghost"}
              onClick={() => setView(v.toLowerCase())}
            >
              {v}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input className="pl-8" placeholder="Search" />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 p-4 border-r border-gray-700">
          <h2 className="font-bold mb-2">Calendars</h2>
          <Button variant="outline" className="w-full mb-2" onClick={() => setIsCalendarDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Calendar
          </Button>
          {calendars.map((calendar: Calendar) => (
            <div key={calendar.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`calendar-${calendar.id}`}
                checked={selectedCalendars.includes(calendar.id)}
                onChange={() => {
                  setSelectedCalendars(prev => 
                    prev.includes(calendar.id)
                      ? prev.filter(id => id !== calendar.id)
                      : [...prev, calendar.id]
                  )
                }}
                className="mr-2"
              />
              <label htmlFor={`calendar-${calendar.id}`} className="flex-grow">{calendar.name}</label>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: calendar.color }}></div>
            </div>
          ))}
        </aside>
        <main className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            {view === 'day' && renderDayView()}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
            {view === 'year' && renderYearView()}
          </ScrollArea>
        </main>
      </div>

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="bg-gray-800 text-gray-100 border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">{currentEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEventSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-gray-300">
                  Title
                </Label>
                <Input id="title" name="title" defaultValue={currentEvent?.title} className="col-span-3 bg-gray-700 border-gray-600 text-gray-100" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-gray-300">
                  Description
                </Label>
                <Input id="description" name="description" defaultValue={currentEvent?.description} className="col-span-3 bg-gray-700 border-gray-600 text-gray-100" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_time" className="text-right text-gray-300">
                  Start Time
                </Label>
                <Input id="start_time" name="start_time" type="datetime-local" defaultValue={currentEvent?.start_time} className="col-span-3 bg-gray-700 border-gray-600 text-gray-100" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_time" className="text-right text-gray-300">
                  End Time
                </Label>
                <Input id="end_time" name="end_time" type="datetime-local" defaultValue={currentEvent?.end_time} className="col-span-3 bg-gray-700 border-gray-600 text-gray-100" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="calendar_id" className="text-right text-gray-300">
                  Calendar
                </Label>
                <Select name="calendar_id" defaultValue={currentEvent?.calendar_id}>
                  <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Select a calendar" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {calendars.map((calendar) => (
                      <SelectItem key={calendar.id} value={calendar.id} className="text-gray-100 focus:bg-gray-700">{calendar.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">{currentEvent ? 'Update' : 'Create'}</Button>
              {currentEvent && (
                <Button type="button" variant="destructive" onClick={() => handleEventDelete(currentEvent.id)} className="bg-red-600 hover:bg-red-700 text-white">
                  Delete
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Calendar</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCalendarSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <Input id="color" name="color" type="color" className="col-span-3" />
              </div>
            </div>
            <Button type="submit">Create</Button>
          </form>
        </DialogContent>
      </Dialog>

      <EventDetailsWindow />
    </div>
  )
}