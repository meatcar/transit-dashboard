/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DirectionId } from './DirectionId';
import type { ScheduleItem } from './ScheduleItem';

export type Itinerary = {
    direction_id: DirectionId;
    /**
     * The headsign from the GTFS. If a stop_headsign is provided in the GTFS, it will be provided here. Refer to the [trip_headsign and stop_headsign](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt) for more information.
     */
    headsign: string;
    /**
     * Direction headsign that represent the overall direction of the trip. Ex : "Northbound".
     */
    direction_headsign?: string;
    /**
     * Headsign merging both regular and direction headsign in a single string for display. Ex "Northbound to downtown center" when "Northbound" is the direction headsign and "Downtown center" is the regular headsign.
     */
    merged_headsign?: string;
    schedule_items: Array<ScheduleItem>;
    /**
     * Branch code for that itinerary. Branch are short string associated with an itinerary that represent version of the route. Ex : The 55 bus has 'A' and 'B' variant. If no branch are present, an empty string is provided.
     */
    branch_code?: string;
};

