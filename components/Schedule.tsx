import * as DateFns from "date-fns";
import { ScheduleItem } from "../transit-api-client/schema/models/ScheduleItem.ts";

interface ScheduleProps {
  schedule: ScheduleItem;
}
export function Schedule({ schedule }: ScheduleProps) {
  function time(t: number) {
    const date = DateFns.fromUnixTime(t);
    return DateFns.format(date, "k:mm");
  }

  return (
    <span className="schedule">
      <span className="ts">
        ◷{time(schedule.scheduled_departure_time)}
      </span>
      {schedule.is_real_time && (
        <span className="ts live">◉{time(schedule.departure_time)}</span>
      )}
    </span>
  );
}
