import React, { createContext, useCallback, useEffect, useState } from "react";
import { demoItem, DemoItem, demoItems } from "../../../_common/models/demoItem.model";

const DEMO_STORE_KEY = "demo-store-items";

export interface DemoContextType {
  items: DemoItem[];
  storeItem: (item: DemoItem) => void;
  clearItems: () => void;
  isLoading: boolean;
}

export const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [items, setItems] = useState<DemoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback<() => Promise<DemoItem[]>>(async () => {
    return new Promise<DemoItem[]>((res, rej) => {
      try {
        const localData = localStorage.getItem(DEMO_STORE_KEY) || "[]";
        res(demoItems.parse(JSON.parse(localData)));
      } catch (e) {
        rej(e);
      }
    });
  }, []);

  const storeItem = useCallback((item: DemoItem) => {
    try {
      const parsed = demoItem.parse(item);
      const newItems = [...items, parsed];
      localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(newItems));
      setItems(newItems);
    } catch(e) {
      console.error("failed to store item");
    }
  }, [items, setItems]);

  const clearItems = useCallback(() => {
    setItems([]);
    localStorage.setItem(DEMO_STORE_KEY, "[]");
  }, [setItems]);

  useEffect(() => {
    setIsLoading(true);
    loadItems()
      .then((res) => {
        setItems(res);
        setIsLoading(false);
      }).catch(error => {
        console.error("Failed to load items:", error);
        setIsLoading(false);
      });
  }, []);


  const value: DemoContextType = {
    items,
    storeItem,
    clearItems,
    isLoading
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};