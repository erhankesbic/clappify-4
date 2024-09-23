'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Plus, X, Tag, Calendar as CalendarIcon, Circle, CheckCircle2, Edit, Clock } from 'lucide-react'
import Button from "@/components/ui/Button" // Changed from named to default import
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
  isCompleted?: boolean;
  tags: string[];
  calendarId: string;
  isAllDay: boolean;
}

const colorOptions = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB'
]

function DayView({ currentDate, events, openEventForm, calendars, toggleTaskCompletion, handleEventClick }: { currentDate: Date, events: EventType[], openEventForm: (date: Date, eventId?: string) => void, calendars: CalendarType[], toggleTaskCompletion: (eventId: string) => void, handleEventClick: (event: EventType) => void }) {
  const timeSlotHeight = 60; // Height of each hour slot in pixels

  const allDayEvents = events.filter(event => 
    event.isAllDay && 
    event.start.getDate() === currentDate.getDate() &&
    event.start.getMonth() === currentDate.getMonth() &&
    event.start.getFullYear() === currentDate.getFullYear()
  )

  const regularEvents = events.filter(event => 
    !event.isAllDay && 
    event.start.getDate() === currentDate.getDate() &&
    event.start.getMonth() === currentDate.getMonth() &&
    event.start.getFullYear() === currentDate.getFullYear()
  )

  const getEventPosition = (event: EventType) => {
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    const top = startHour * timeSlotHeight;
    const height = (endHour - startHour) * timeSlotHeight;
    return { top, height };
  };

  const groupOverlappingEvents = (events: EventType[]) => {
    const sortedEvents = events.sort((a, b) => a.start.getTime() - b.start.getTime());
    const groups: EventType[][] = [];

    for (const event of sortedEvents) {
      let placed = false;
      for (const group of groups) {
        if (!group.some(groupEvent => 
          (event.start < groupEvent.end && event.end > groupEvent.start)
        )) {
          group.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) {
        groups.push([event]);
      }
    }

    return groups;
  };

  const eventGroups = groupOverlappingEvents(regularEvents);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold mb-2">
          {currentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>
        <div className="space-y-2">
          <h3 className="font-semibold">All-day events</h3>
          {allDayEvents.map(event => (
            <div 
              key={event.id} 
              className="p-2 text-sm rounded flex items-center justify-between cursor-pointer hover:bg-gray-700"
              style={{ 
                backgroundColor: calendars.find(cal => cal.id === event.calendarId)?.color || '#3B82F6',
                color: 'white'
              }}
              onClick={() => handleEventClick(event)}
            >
              <span>{event.title}</span>
              {event.isTask && (
                <button onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(event.id) }} className="ml-2">
                  {event.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="relative" style={{ height: `${timeSlotHeight * 24}px` }}>
          {hours.map(hour => (
            <div 
              key={hour} 
              className="absolute w-full border-t border-gray-700 flex"
              style={{ top: `${hour * timeSlotHeight}px`, height: `${timeSlotHeight}px` }}
            >
              <div className="w-16 pr-2 text-right text-xs text-gray-500">
                {hour}:00
              </div>
              <div className="flex-1" onClick={() => {
                const date = new Date(currentDate);
                date.setHours(hour, 0, 0, 0);
                openEventForm(date);
              }}></div>
            </div>
          ))}
          {eventGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.map((event, eventIndex) => {
                const { top, height } = getEventPosition(event);
                const width = 100 / group.length;
                const left = eventIndex * width;
                return (
                  <div 
                    key={event.id} 
                    className="absolute rounded overflow-hidden cursor-pointer p-1 text-xs"
                    style={{ 
                      backgroundColor: calendars.find(cal => cal.id === event.calendarId)?.color || '#3B82F6',
                      color: 'white',
                      top: `${top}px`,
                      height: `${height}px`,
                      left: `calc(${left}% + 64px)`,
                      width: `calc(${width}% - 2px)`,
                      zIndex: 10
                    }}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="font-semibold">{event.title}</div>
                    <div>{`${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</div>
                    {event.isTask && (
                      <button onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(event.id) }} className="mt-1">
                        {event.isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

function WeekView({ currentDate, events, openEventForm, calendars, toggleTaskCompletion, handleEventClick }: { currentDate: Date, events: EventType[], openEventForm: (date: Date, eventId?: string) => void, calendars: CalendarType[], toggleTaskCompletion: (eventId: string) => void, handleEventClick: (event: EventType) => void }) {
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1))

  const allDayEvents = events.filter(event => 
    event.isAllDay && 
    event.start >= startOfWeek &&
    event.start < new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
  )

  const timeSlotHeight = 60; // Height of each hour slot in pixels

  const getEventPosition = (event: EventType) => {
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    const top = startHour * timeSlotHeight;
    const height = (endHour - startHour) * timeSlotHeight;
    return { top, height };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 p-2 border-b border-gray-700">
        <h3 className="font-semibold mb-2">All-day events</h3>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => {
            const date = new Date(startOfWeek)
            date.setDate(startOfWeek.getDate() + index)
            const dayEvents = allDayEvents.filter(event => 
              event.start.getDate() === date.getDate() &&
              event.start.getMonth() === date.getMonth() &&
              event.start.getFullYear() === date.getFullYear()
            )
            return (
              <div key={day} className="space-y-1">
                {dayEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="p-2 text-sm rounded flex items-center justify-between cursor-pointer hover:bg-gray-700"
                    style={{ 
                      backgroundColor: calendars.find(cal => cal.id === event.calendarId)?.color || '#3B82F6',
                      color: 'white'
                    }}
                    onClick={() => handleEventClick(event)}
                  >
                    <span>{event.title}</span>
                    {event.isTask && (
                      <button onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(event.id) }} className="ml-2">
                        {event.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 gap-px bg-gray-700" style={{ height: `${timeSlotHeight * 24}px` }}>
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
            <React.Fragment key={hour}>
              <div className="bg-gray-900 p-2 text-right text-xs text-gray-500">
                {hour}:00
              </div>
              {weekDays.map((day, index) => {
                const cellDate = new Date(startOfWeek)
                cellDate.setDate(startOfWeek.getDate() + index)
                cellDate.setHours(hour)
                return (
                  <div key={`${day}-${hour}`} className="bg-gray-800 border-t border-gray-700 p-1 relative" style={{ height: `${timeSlotHeight}px` }} onClick={() => openEventForm(cellDate)}>
                    {events.filter(event => 
                      !event.isAllDay &&
                      event.start.getDate() === cellDate.getDate() &&
                      event.start.getMonth() === cellDate.getMonth() &&
                      event.start.getFullYear() === cellDate.getFullYear() &&
                      event.start.getHours() <= hour &&
                      event.end.getHours() > hour
                    ).map(event => {
                      const { top, height } = getEventPosition(event);
                      return (
                        <div 
                          key={event.id} 
                          className="absolute left-0 right-0 mx-1 p-1 text-xs rounded overflow-hidden cursor-pointer"
                          style={{ 
                            backgroundColor: calendars.find(cal => cal.id === event.calendarId)?.color || '#3B82F6',
                            color: 'white',
                            top: `${top - hour * timeSlotHeight}px`,
                            height: `${height}px`,
                            zIndex: 10
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event)
                          }}
                        >
                          <div className="font-semibold">{event.title}</div>
                          <div>{`${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</div>
                          {event.isTask && (
                            <button onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(event.id) }} className="mt-1">
                              {event.isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

function MonthView({ currentDate, events, openEventForm, calendars, toggleTaskCompletion, handleEventClick }: { currentDate: Date, events: EventType[], openEventForm: (date: Date, eventId?: string) => void, calendars: CalendarType[], toggleTaskCompletion: (eventId: string) => void, handleEventClick: (event: EventType) => void }) {
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
            <div className="space-y-1 mt-1">
              {dayEvents.map(event => (
                <div 
                  key={event.id} 
                  className="text-xs p-1 rounded cursor-pointer flex items-center justify-between"
                  style={{ 
                    backgroundColor: calendars.find(cal => cal.id === event.calendarId)?.color || '#3B82F6',
                    color: 'white'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEventClick(event)
                  }}
                >
                  <span>{event.title}</span>
                  {event.isTask && (
                    <button onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(event.id) }} className="ml-2">
                      {event.isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
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
  const [isCalendarFormOpen, setIsCalendarFormOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<EventType>>({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    isTask: false,
    tags: [],
    calendarId: '1',
    isAllDay: false
  })
  const [newTag, setNewTag] = useState<Partial<TagType>>({
    name: '',
    color: colorOptions[0]
  })
  const [newCalendar, setNewCalendar] = useState<Partial<CalendarType>>({
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
        calendarId: '1',
        isAllDay: false
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
        isCompleted: false,
        tags: newEvent.tags || [],
        calendarId: newEvent.calendarId || '1',
        isAllDay: newEvent.isAllDay || false
      }
      setEvents([...events, eventToAdd])
    }
    closeEventForm()
  }

  const toggleTaskCompletion = (eventId: string) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, isCompleted: !event.isCompleted } : event
    ))
  }

  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event)
  }

  const closeEventDetails = () => {
    setSelectedEvent(null)
  }

  const setEventDuration = (durationInMinutes: number) => {
    const endTime = new Date(newEvent.start!.getTime() + durationInMinutes * 60000);
    setNewEvent({ ...newEvent, end: endTime });
  };

  const renderCalendarView = () => {
    switch (view) {
      case 'Day':
        return <DayView currentDate={currentDate} events={events} openEventForm={openEventForm} calendars={calendars} toggleTaskCompletion={toggleTaskCompletion} handleEventClick={handleEventClick} />
      case 'Week':
        return <WeekView currentDate={currentDate} events={events} openEventForm={openEventForm} calendars={calendars} toggleTaskCompletion={toggleTaskCompletion} handleEventClick={handleEventClick} />
      case 'Month':
        return <MonthView currentDate={currentDate} events={events} openEventForm={openEventForm} calendars={calendars} toggleTaskCompletion={toggleTaskCompletion} handleEventClick={handleEventClick} />
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
              variant={view === viewType ? "lavender" : "outline"}
              size="sm"
              onClick={() => setView(viewType)}
            >
              {viewType}
            </Button>
          ))}
          <Button variant="lavender" size="sm" onClick={() => openEventForm()}>
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
          <Button variant="lavender" size="sm" onClick={() => setIsCalendarFormOpen(true)} className="w-full text-gray-800 hover:text-gray-100 hover:bg-gray-800 mb-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Calendar
          </Button>
          <h2 className="font-semibold mb-2">Tags</h2>
          <ul className="space-y-2 mb-4">
            {tags.map(tag => (
              <li key={tag.id} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }}></span>
                <span>{tag.name}</span>
              </li>
            ))}
          </ul>
          <Button variant="lavender" size="sm" onClick={() => setIsTagFormOpen(true)} className="w-full text-gray-800 hover:text-gray-100 hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Tag
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
              <Label>Duration</Label>
              <div className="flex space-x-2 mt-1">
                <Button type="button" onClick={() => setEventDuration(30)} variant="outline" size="sm">30 min</Button>
                <Button type="button" onClick={() => setEventDuration(60)} variant="outline" size="sm">1 hour</Button>
                <Button type="button" onClick={() => setEventDuration(120)} variant="outline" size="sm">2 hours</Button>
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
                    variant={newEvent.tags?.includes(tag.id) ? "lavender" : "outline"}
                    size="sm"
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAllDay"
                checked={newEvent.isAllDay}
                onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
              />
              <Label htmlFor="isAllDay">All-day event</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="lavender" onClick={closeEventForm}>
                Cancel
              </Button>
              <Button type="submit" variant="lavender">{editingEventId ? 'Update' : 'Create'} Event</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isTagFormOpen} onOpenChange={setIsTagFormOpen}>
        <DialogContent className="bg-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (newTag.name) {
              setTags([...tags, { id: Date.now().toString(), name: newTag.name, color: newTag.color || colorOptions[0] }])
              setNewTag({ name: '', color: colorOptions[0] })
              setIsTagFormOpen(false)
            }
          }} className="space-y-4">
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
              <Label htmlFor="tagColor">Tag Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full ${newTag.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTag({ ...newTag, color })}
                  ></button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="lavender" onClick={() => setIsTagFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="lavender">Create Tag</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isCalendarFormOpen} onOpenChange={setIsCalendarFormOpen}>
        <DialogContent className="bg-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Create New Calendar</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (newCalendar.name) {
              setCalendars([...calendars, { id: Date.now().toString(), name: newCalendar.name, color: newCalendar.color || colorOptions[0] }])
              setNewCalendar({ name: '', color: colorOptions[0] })
              setIsCalendarFormOpen(false)
            }
          }} className="space-y-4">
            <div>
              <Label htmlFor="calendarName">Calendar Name</Label>
              <Input
                id="calendarName"
                value={newCalendar.name}
                onChange={(e) => setNewCalendar({ ...newCalendar, name: e.target.value })}
                className="bg-gray-700 text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="calendarColor">Calendar Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full ${newCalendar.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCalendar({ ...newCalendar, color })}
                  ></button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="lavender" onClick={() => setIsCalendarFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="lavender">Create Calendar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="bg-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{selectedEvent?.description}</p>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{selectedEvent?.start.toLocaleString()} - {selectedEvent?.end.toLocaleString()}</span>
            </div>
            {selectedEvent?.isTask && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedEvent.isCompleted}
                  onChange={() => toggleTaskCompletion(selectedEvent.id)}
                  className="mr-2"
                />
                <span>{selectedEvent.isCompleted ? 'Completed' : 'Not completed'}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {selectedEvent?.tags.map(tagId => {
                const tag = tags.find(t => t.id === tagId)
                return tag ? (
                  <span
                    key={tag.id}
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: tag.color, color: 'white' }}
                  >
                    {tag.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => openEventForm(undefined, selectedEvent?.id)} variant="lavender">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={closeEventDetails} variant="lavender">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}