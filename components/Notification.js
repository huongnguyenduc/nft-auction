import React from "react";
import { Notification } from "rsuite";

const NotificationUI = ({ type, message }) => {
  return (
    <Notification type={type} header={type} closable>
      <div className="py-4 px-2">{message}</div>
    </Notification>
  );
};

export default NotificationUI;
