import React from "react";
const DrawerStateContext = React.createContext();
const DrawerDispatchContext = React.createContext();

async function openDrawer(drawerDispatch) {
  drawerDispatch({ type: "open" });
}

function closeDrawer(drawerDispatch) {
  drawerDispatch({ type: "close" });
}

function drawerReducer(state, action) {
  switch (action.type) {
    case "open": {
      return { isDrawerOpen: true };
    }
    case "close": {
      return { isDrawerOpen: false };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function DrawerProvider({ children }) {
  const [state, dispatch] = React.useReducer(drawerReducer, {
    isDrawerOpen: false,
  });
  return (
    <DrawerStateContext.Provider value={state}>
      <DrawerDispatchContext.Provider value={dispatch}>
        {children}
      </DrawerDispatchContext.Provider>
    </DrawerStateContext.Provider>
  );
}

function useDrawerState() {
  const context = React.useContext(DrawerStateContext);
  if (context === undefined) {
    throw new Error("useDrawerState must be used within a DrawerProvider");
  }
  return context;
}

function useDrawerDispatch() {
  const context = React.useContext(DrawerDispatchContext);
  if (context === undefined) {
    throw new Error("useDrawerDispatch must be used within a DrawerProvider");
  }
  return context;
}

export {
  DrawerProvider,
  useDrawerState,
  useDrawerDispatch,
  openDrawer,
  closeDrawer,
};
