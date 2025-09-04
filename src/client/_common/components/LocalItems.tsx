import { useDemoStore } from "../hooks/useDemoStore";

export const LocalItems = () => {
  const { isLoading, items, storeItem, clearItems } = useDemoStore();
  
  return <details className="container">
    <summary>Local items</summary>
    {isLoading
      ? <div className="loader" />
      : <>
          <div className="flex">
            <button onClick={() => storeItem({
              itemId: crypto.randomUUID(),
              action: "click",
              details: new Date().toISOString()
            })}>
              Add Item
            </button>
            &nbsp;
            <button onClick={clearItems}>
              Clear Items
            </button>
          </div>
          {items.length
            ? items.map(item => <p key={item.itemId}>
                {item.action} at {item.details}
              </p>)
            : <p>No items yet...</p>
            }
        </>
      }
  </details>
}