import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { useState } from "react"
import { useApi } from "../hooks/useApi"

export default function DragDropSquad({ squad, onChange }) {
  const [items, setItems] = useState(squad)

  const onDragEnd = async (result) => {
    if (!result.destination) return
    const newItems = Array.from(items)
    const [moved] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, moved)
    setItems(newItems)
    // send PATCH for each changed squad_number
    await onChange(newItems)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="squad">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((p, index) => (
              <Draggable key={p.id} draggableId={p.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {p.name}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}