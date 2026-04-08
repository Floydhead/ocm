import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { useEffect, useState } from "react"

export default function DragDropSquad({ squad, onChange, renderRow }) {
  const [items, setItems] = useState(squad || [])

  useEffect(() => {
    setItems(squad || [])
  }, [squad])

  const onDragEnd = async (result) => {
    if (!result.destination) return

    const newItems = Array.from(items)
    const [moved] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, moved)

    setItems(newItems)
    if (onChange) {
      await onChange(newItems)
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="squad">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item, index) => (
              <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-3"
                  >
                    {renderRow ? renderRow(item, index) : <div>{item.player?.name ?? item.name}</div>}
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
