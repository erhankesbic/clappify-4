'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Search, Plus, X, Tag, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = Array.from({ length: 24 }, (_, i) => i)

type ViewType = 'Day' | 'Week' | 'Month' | 'Year'
type TagType = {
  id: string;
  name: string;
  color: string;
}
type CalendarType = {
  id: string;
  name: string;
  color: string;
}
type EventType = {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  isTask: boolean;
  tags: string[];
  calendarId: string;
}

const colorOptions = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB'
]

export default function Component() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>('Week')
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState<EventType[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [calendars, setCalendars] = useState<CalendarType[]>([
    { id: '1', name: 'Personal', color: '#FF6B6B' },
    { id: '2', name: 'Work', color: '#4ECDC4' },
    { id: '3', name: 'Birthdays', color: '#45B7D1' },
  ])
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  const [isTagFormOpen, setIsTagFormOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<EventType>>({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    isTask: false,
    tags: [],
    calendarId: '1'
  })
  const [newTag, setNewTag] = useState<Partial<TagType>>({
    name: '',
    color: colorOptions[0]
  })

  const goToPreviousPeriod = () => {
    switch (view) {
      case 'Day':
        setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))
        break
      case 'Week':
        setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))
        break
      case 'Month':
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
        break
      case 'Year':
        setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1))
        break
    }
  }

  const goToNextPeriod = () => {
    switch (view) {
      case 'Day':
        setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))
        break
      case 'Week':
        setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))
        break
      case 'Month':
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
        break
      case 'Year':
        setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))
        break
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    // Implement actual search functionality here
  }

  const openEventForm = (date?: Date, eventId?: string) => {
    if (eventId) {
      const eventToEdit = events.find(e => e.id === eventId)
      if (eventToEdit) {
        setNewEvent({ ...eventToEdit })
        setEditingEventId(eventId)
      }
    } else {
      setNewEvent({
        title: '',
        description: '',
        start: date || new Date(),
        end: date ? new Date(date.getTime() + 60 * 60 * 1000) : new Date(new Date().getTime() + 60 * 60 * 1000),
        isTask: false,
        tags: [],
        calendarId: '1'
      })
      setEditingEventId(null)
    }
    setIsEventFormOpen(true)
  }

  const closeEventForm = () => {
    setIsEventFormOpen(false)
    setEditingEventId(null)
  }

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingEventId) {
      setEvents(events.map(event => 
        event.id === editingEventId ? { ...event, ...newEvent, id: editingEventId } as EventType : event
      ))
    } else {
      const eventToAdd: EventType = {
        id: Date.now().toString(),
        title: newEvent.title || '',
        description: newEvent.description || '',
        start: newEvent.start || new Date(),
        end: newEvent.end || new Date(),
        isTask: newEvent.isTask || false,
        tags: newEvent.tags || [],
        calendarId: newEvent.calendarId || '1'
      }
      setEvents([...events, eventToAdd])
    }
    closeEventForm()
  }

  const openTagForm = () => {
    setNewTag({
      name: '',
      color: colorOptions[0]
    })
    setIsTagFormOpen(true)
  }

  const closeTagForm = () => {
    setIsTagFormOpen(false)
  }

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tagToAdd: TagType = {
      id: Date.now().toString(),
      name: newTag.name || '',
      color: newTag.color || colorOptions[0]
    }
    setTags([...tags, tagToAdd])
    closeTagForm()
  }

  const renderCalendarView = () => {
    switch (view) {
      case 'Day':
        return <DayView currentDate={currentDate} events={events} openEventForm={openEventForm} calendars={calendars} />
      case 'Week':
        return <WeekView currentDate={currentDate} events={events} openEventForm={openEventForm} calendars={calendars} />
      case 'Month':
        return <MonthView currentDate={currentDate} events={events} openEventForm={openEventForm} calendars={calendars} />
      case 'Year':
        return <YearView currentDate={currentDate} events={events} calendars={calendars} />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousPeriod} className="text-gray-300 hover:text-gray-100 hover:bg-gray-800">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextPeriod} className="text-gray-300 hover:text-gray-100 hover:bg-gray-800">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={goToToday} className="text-gray-900 bg-gray-300 hover:bg-gray-200">
              Today
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {(['Day', 'Week', 'Month', 'Year'] as ViewType[]).map((viewType) => (
            <Button
              key={viewType}
              variant={view === viewType ? "default" : "outline"}
              size="sm"
              onClick={() => setView(viewType)}
              className={view === viewType ? "bg-gray-300 text-gray-900" : "text-gray-300 hover:text-gray-100 hover:bg-gray-800"}
            >
              {viewType}
            </Button>
          ))}
          <Button variant="secondary" size="sm" onClick={() => openEventForm()} className="text-gray-900 bg-gray-300 hover:bg-gray-200">
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-8 bg-gray-800 border-gray-700 text-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-48 p-4 border-r border-gray-700 overflow-y-auto">
          <h2 className="font-semibold mb-2">Calendars</h2>
          <ul className="space-y-2 mb-4">
            {calendars.map(calendar => (
              <li key={calendar.id} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: calendar.color }}></span>
                <span>{calendar.name}</span>
              </li>
            ))}
          </ul>
          <h2 className="font-semibold mb-2">Tags</h2>
          <ul className="space-y-2 mb-4">
            {tags.map(tag => (
              <li key={tag.id} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }}></span>
                <span>{tag.name}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" onClick={openTagForm} className="w-full text-gray-300 hover:text-gray-100 hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Create Tag
          </Button>
        </aside>
        <main className="flex-1 overflow-auto">
          {renderCalendarView()}
        </main>
      </div>
      <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
        <DialogContent className="bg-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>{editingEventId ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            <DialogDescription>
              Fill in the details for your event or task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEventSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="bg-gray-700 text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="bg-gray-700 text-gray-100"
              />
            </div>
            <div className="flex space-x-4">
              <div>
                <Label htmlFor="start">Start</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={newEvent.start?.toISOString().slice(0, 16)}
                  onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                  className="bg-gray-700 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="end">End</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={newEvent.end?.toISOString().slice(0, 16)}
                  onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                  className="bg-gray-700 text-gray-100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="calendar">Calendar</Label>
              <Select
                value={newEvent.calendarId}
                onValueChange={(value) => setNewEvent({ ...newEvent, calendarId: value })}
              >
                <SelectTrigger className="bg-gray-700 text-gray-100">
                  <SelectValue placeholder="Select a calendar" />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map(calendar => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: calendar.color }}></span>
                        <span>{calendar.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`${newEvent.tags?.includes(tag.id) ? 'bg-opacity-50' : ''} text-gray-300 hover:text-gray-100`}
                    style={{ borderColor: tag.color }}
                    onClick={() => {
                      const updatedTags = newEvent.tags?.includes(tag.id)
                        ? newEvent.tags.filter(id => id !== tag.id)
                        : [...(newEvent.tags || []), tag.id]
                      setNewEvent({ ...newEvent, tags: updatedTags })
                    }}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isTask"
                checked={newEvent.isTask}
                onChange={(e) => setNewEvent({ ...newEvent, isTask: e.target.checked })}
              />
              <Label htmlFor="isTask">This is a task</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={closeEventForm} className="text-gray-300 hover:text-gray-100 hover:bg-gray-800">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">{editingEventId ? 'Update' : 'Create'} Event</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isTagFormOpen} onOpenChange={setIsTagFormOpen}>
        <DialogContent className="bg-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag and choose its color.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTagSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                className="bg-gray-700 text-gray-100"
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full ${newTag.color === color ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTag({ ...newTag, color })}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={closeTagForm} className="text-gray-300 hover:text-gray-100 hover:bg-gray-800">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Create Tag</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DayView({ currentDate, events, openEventForm, calendars }: { currentDate: Date, events: EventType[], openEventForm: (date: Date, eventId?: string) => void, calendars: CalendarType[] }) {
  return (
    <div className="grid grid-cols-1 gap-px bg-gray-700">
      {hours.map(hour => {
        const hourDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour)
        const hourEvents = events.filter(event => 
          event.start.getHours() === hour && 
          event.start.getDate() === currentDate.getDate() &&
          event.start.getMonth() === currentDate.getMonth() &&
          event.start.getFullYear() === currentDate.getFullYear()
        )
        return (
          <div key={hour} className="bg-gray-800 p-2 border-t border-gray-700 min-h-[60px]" onClick={() => openEventForm(hourDate)}>
            <span className="text-xs text-gray-500">{hour}:00</span>
            {hourEvents.map(event => (
              <div 
                key={event.id} 
                className="mt-1 p-1 text-xs rounded cursor-pointer"
                style={{ 
                  backgroundColor: calendars.find(cal => cal.id === event.calendarId)?.color || '#3B82F6'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  openEventForm(event.start, event.id)
                }}
              >
                {event.title}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function WeekView({ currentDate, events, openEventForm, calendars }: { currentDate: Date, events: EventType[], openEventForm: (date: Date, eventId?: string) => void, calendars: CalendarType[] }) {
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1))

  return (
    <div className="grid grid-cols-8 gap-px bg-gray-700">
      <div className="bg-gray-900"></div>
      {weekDays.map((day, index) => {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + index)
        return (
          <div key={day} className="bg-gray-900 p-2 text-center">
            <div>{day}</div>
            <div className="text-sm">{date.getDate()}</div>
          </div>
        )
      })}
      {hours.map(hour => (
        <>
          <div key={hour} className="bg-gray-900 p-2 text-right text-xs text-gray-500">
            {hour}:00
          </div>
          {weekDays.map((day, index) => {
            const cellDate = new Date(startOfWeek)
            cellDate.setDate(startOfWeek.getDate() + index)
            cellDate.setHours(hour)
            const cellEvents = events.filter(event => 
              event.start.getHours() === hour && 
              event.start.getDate() === cellDate.getDate() &&
              event.start.getMonth() === cellDate.getMonth() &&
              event.start.getFullYear() === cellDate.getFullYear()
            )
            return (
              <div key={`${day}-${hour}`} className="bg-gray-800 border-t border-gray-700 p-1 min-h-[30px]" onClick={() => openEventForm(cellDate)}>
                {cellEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="text-xs p-1 rounded mb-1 cursor-pointer"
                    style={{ 
                      backgroundColor: calendars.find(cal => cal.id === event.calendarId)?.color || '#3B82F6'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      openEventForm(event.start, event.id)
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            )
          })}
        </>
      ))}
    </div>
  )
}

function MonthView({ currentDate, events, openEventForm, calendars }: { currentDate: Date, events: EventType[], openEventForm: (date: Date, eventId?: string) => void, calendars: CalendarType[] }) {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1))

  const days = []
  let day = new Date(startDate)
  while (days.length < 42) {
    days.push(new Date(day))
    day.setDate(day.getDate() + 1)
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-700">
      {weekDays.map(day => (
        <div key={day} className="bg-gray-900 p-2 text-center">{day}</div>
      ))}
      {days.map((date, index) => {
        const isCurrentMonth = date.getMonth() === currentDate.getMonth()
        const dayEvents = events.filter(event => 
          event.start.getDate() === date.getDate() &&
          event.start.getMonth() === date.getMonth() &&
          event.start.getFullYear() === date.getFullYear()
        )
        return (
          <div 
            key={index} 
            className={`bg-gray-800 p-2 min-h-[100px] ${isCurrentMonth ? 'text-gray-100' : 'text-gray-500'}`}
            onClick={() => openEventForm(date)}
          >
            <span className="text-sm">{date.getDate()}</span>
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className="text-xs p-1 rounded mt-1 cursor-pointer"
                style={{ 
                  backgroundColor: calendars.find(cal => cal.id === event.calendarId)?.color || '#3B82F6'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  openEventForm(event.start, event.id)
                }}
              >
                {event.title}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function YearView({ currentDate, events, calendars }: { currentDate: Date, events: EventType[], calendars: CalendarType[] }) {
  const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1))

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {months.map(month => {
        const monthEvents = events.filter(event => 
          event.start.getMonth() === month.getMonth() &&
          event.start.getFullYear() === month.getFullYear()
        )
        return (
          <div key={month.getMonth()} className="bg-gray-800 p-2 rounded">
            <h3 className="text-center font-semibold mb-2">
              {month.toLocaleString('default', { month: 'long' })}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {weekDays.map(day => (
                <div key={day} className="text-center text-gray-500">{day[0]}</div>
              ))}
              {Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }).map((_, i) => {
                const dayEvents = monthEvents.filter(event => event.start.getDate() === i + 1)
                return (
                  <div key={i} className="text-center">
                    {i + 1}
                    {dayEvents.length > 0 && (
                      <div 
                        className="w-2 h-2 rounded-full mx-auto mt-1"
                        style={{ 
                          backgroundColor: calendars.find(cal => cal.id === dayEvents[0].calendarId)?.color || '#3B82F6'
                        }}
                      ></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}