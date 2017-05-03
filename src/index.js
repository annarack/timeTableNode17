
import '../graphic/tableStyle.sass'
import model from './model'

let buildings = {}
let times     = []

model.forEach(event => {
	// create new building key
	if (!buildings[event.building])
		buildings[event.building] = []
	// fill building key with events
	if (buildings[event.building].indexOf(event.room) == -1)
		buildings[event.building].push(event.room)
	// time
	if (times.indexOf(event.start) == -1)
		times.push(event.start)
	if (times.indexOf(event.end) == -1)
		times.push(event.end)
})
// sort times
times = times.sort()

// create table
let createElement = (type, parent, classes, innerHTML) => {
	let el = document.createElement(type)
	if (classes) classes.split(', ').forEach(cl => el.classList.add(cl))
	if (innerHTML) el.innerHTML = innerHTML
	parent.appendChild(el)
	return el
}

let createTable = (parent, classes, innerHTML) => createElement('table', parent, classes, innerHTML)
let createRowIn = (parent, classes, innerHTML) => createElement('tr', parent, classes, innerHTML)
let createColIn = (parent, classes, innerHTML) => createElement('td', parent, classes, innerHTML)

let table = createTable(document.body, 'timetable')
// create header
let headerRow = createRowIn(table)
let headerRowSpacer = createColIn(headerRow, 'spacer')
// create buildings
for (let i in buildings) {
	let buildingColumn = createColIn(headerRow, 'building', i)
	buildingColumn.colSpan = buildings[i].length
	createColIn(headerRow, 'spacer')
}

// create header
let roomsRow = createRowIn(table)
let roomsRowSpacer = createColIn(roomsRow, 'spacer, time', times[0])

// create rooms
for (let i in buildings) {
	let rooms = buildings[i]
	rooms.forEach(room => createColIn(roomsRow, 'room', room))
	createColIn(roomsRow, 'spacer')
}

let calculateRowSpan = event => {
	var rowSpan = 1
	for (let i = 0; i < times.length; i ++) {
		let time = times[i]
		if (event.start == time) rowSpan = i
		if (event.end   == time) {rowSpan = i - rowSpan; break}
	}
	return rowSpan * 2 - 1
}

let createEvent = (parent, event) => {
	let color = ['pink', 'green', 'blue', 'orange', 'yellow', 'purple'][parseInt(Math.random() * 6)]
	let name = `${event.name}<div class="time">from ${event.start} to ${event.end}</div>`
	let column = createColIn(parent, 'event, '+ color, name)
	column.rowSpan = calculateRowSpan(event)
	return column
}

let countRooms = () => {
	let number = 0
	for (let i in buildings)
		number += buildings[i].length
	return number
}
// create lines
for (var i = 0; i < times.length - 1; i ++) {
	let line = createRowIn(table, 'line')
	let time = createRowIn(table)
	createColIn(line, 'spacer')
	createColIn(time, 'time', times[i+1])
	let start = times[i]
	for (let n in buildings) {
		let rooms = buildings[n]
		rooms.forEach(room => {
			let eventsForThisRoom = model.filter(event => event.room == room)
			let event = eventsForThisRoom.filter(event => event.start == start)[0]
			// if we have an event in this room at this time
			if (event) createEvent(line, event)
			// if we intersect with other events that have bigger rowSpan
			else if (eventsForThisRoom.filter(event =>
				event.start < start && start < event.end).length == 0)
					createColIn(line)
		})
		rooms.forEach(room => {
			let eventsForThisRoom = model.filter(event => event.room == room)
			let event = eventsForThisRoom.filter(event => event.start == start)[0]
			// if we have an event in this room at this time
			// if (event) createEvent(line, event)
			// if we intersect with other events that have bigger rowSpan
			if (eventsForThisRoom.filter(event =>
				event.start < start && start < event.end).length == 0)
					createColIn(time,'time')
		})
		createColIn(line, 'spacer')
		createColIn(time, 'spacer')
	}
}
