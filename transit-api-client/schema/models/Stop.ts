/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GlobalStopId } from './GlobalStopId.ts';

export type Stop = {
    /**
     * Distance from the query point in meters. Not provided in `route_details` or when there's no location in the query.
     */
    distance?: number;
    global_stop_id: GlobalStopId;
    /**
     * `location_types` from the [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt). The following values may be returned:
     *
     * * `0`: Routable stops (whether freestanding or located within a station)
     *
     * * `2`: Entrances to stations
     *
     *
     *
     */
    location_type: number;
    /**
     * This field can be used to identify routable stops or entrances that are part of the same station. If applicable, this field contains a `GlobalStopId` referring to the containing station
     */
    parent_station_global_stop_id?: string;
    /**
     * For routable stops, route type from the [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt)
     */
    route_type?: number;
    stop_lat: number;
    stop_lon: number;
    /**
     * Stop name from the [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt)'
     */
    stop_name: string;
    /**
     * `stop_code` of the stop, from the [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt)
     */
    stop_code?: string;
    /**
     * A identifier for this stop. In the majority of cases, it will be the same `stop_id` found from the original GTFS. Can be an empty string if no stop id is provided.
     */
    rt_stop_id?: string;
    /**
     * `wheelchair_boarding` of the stop, from the [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt)
     */
    wheelchair_boarding?: Stop.wheelchair_boarding;
};

export namespace Stop {

    /**
     * `wheelchair_boarding` of the stop, from the [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt)
     */
    export enum wheelchair_boarding {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
    }


}

