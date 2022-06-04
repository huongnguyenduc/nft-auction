import React from "react";
import { DateRangePicker } from "rsuite";
import { startOfDay, endOfDay, addDays } from "date-fns";
import "rsuite/dist/rsuite.min.css";

const Ranges = [
  {
    label: "1 day",
    value: [startOfDay(new Date()), endOfDay(new Date())],
  },
  {
    label: "3 days",
    value: [startOfDay(new Date()), endOfDay(addDays(new Date(), 2))],
  },
  {
    label: "7 days",
    value: [startOfDay(new Date()), endOfDay(addDays(new Date(), 6))],
  },
  {
    label: "1 month",
    value: [startOfDay(new Date()), endOfDay(addDays(new Date(), 30))],
  },
  {
    label: "3 months",
    value: [startOfDay(new Date()), endOfDay(addDays(new Date(), 90))],
  },
];

const DateRange = ({ value, onChange }) => {
  return (
    <DateRangePicker
      format="dd-MM-yyyy HH:mm:ss"
      onChange={onChange}
      value={value}
      character=" - "
      ranges={Ranges}
    />
  );
};

export default DateRange;
