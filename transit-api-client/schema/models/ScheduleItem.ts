/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TripSearchKey } from './TripSearchKey';

export type ScheduleItem = {
    /**
     * Departure time of the schedule item in UNIX time.  If `is_real_time` is false, it will be equal to `scheduled_departure_time`.
     */
    departure_time: number;
    /**
     * If this departure has been cancelled. Cancelled departures should either be crossed of or not shown at all in a UI.
     */
    is_cancelled: boolean;
    /**
     * If the departure_time is based on real time data.
     */
    is_real_time: boolean;
    /**
     * A identifier for that trip. In the majority of cases, it will be the same `trip_id` found from the original GTFS. Note that two departures can have the same `rt_trip_id` if one of them has been duplicated by real time data. Can be empty string if no trip id is provided.
     */
    rt_trip_id?: string;
    /**
     * Departure time based on schedule information in UNIX time.
     */
    scheduled_departure_time: number;
    /**
     * `wheelchair_accessible` of the corresponding trip, from the [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt)
     */
    wheelchair_accessible?: ScheduleItem.wheelchair_accessible;
    trip_search_key?: TripSearchKey;
};

export namespace ScheduleItem {

    /**
     * `wheelchair_accessible` of the corresponding trip, from the [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt)
     */
    export enum wheelchair_accessible {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
    }


}

