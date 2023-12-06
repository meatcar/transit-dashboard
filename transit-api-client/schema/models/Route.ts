/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GlobalRouteId } from './GlobalRouteId.ts';
import type { Itinerary } from './Itinerary.ts';

export type Route = {
    global_route_id: GlobalRouteId;
    /**
     * Itineraries will be provided in /nearby_stops but not /routes_for_network, /route_details, or /trip_details
     */
    itineraries?: Array<Itinerary>;
    /**
     * [`route_long_name`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt) from the GTFS
     */
    route_long_name: string;
    /**
     * [`route_short_name`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt) from the GTFS
     */
    route_short_name: string;
    /**
     * Route type as defined in [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt)
     */
    route_type: number;
    /**
     * Route color as defined in [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt)
     */
    route_color: string;
    /**
     * Route text color as defined in [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt)
     */
    route_text_color: string;
    /**
     * The network name associated with that route. A network name is a user-presentable string that represent the branding of the route.
     *
     * It is not exactly the agency as sometime the branding will be slighly different even within the same agency. For example, `network_name` will be different for local bus and commuter bus in Baltimore since they are handled as two different networks on the user's perspective even if operated by the same agency.
     *
     * Network name should be unique inside a metropolitian region but can be reused across regions. For example "MTA" will be used for both MTA in NYC and MTA in Baltimore. For an unique value, please use `route_network_id`.
     */
    route_network_name?: string;
    /**
     * A global unique identifier for the network. The network id will be constant on a best-effort basis and can change when network redesign and other major changes happens.
     *
     * For more detail about network, please refer to `route_network_name`.
     */
    route_network_id?: string;
    /**
     * Long name for the route suitable to be used in a text-to-speech context. Not suitable for display.
     */
    tts_long_name?: string;
    /**
     * Short name for the route suitable to be used in a text-to-speech context. Not suitable for display.
     */
    tts_short_name?: string;
    /**
     * If routes need to be sorted in the usual order they are shown in, sorting should be based of this key.
     *
     * For example, Lettered MTA Subway routes are usually shown in the following order : 'A', 'C', 'E', 'B', 'D', etc. The short name is not suitable for sorting in this case so the `sorting_key` should be used.
     */
    sorting_key?: string;
    /**
     * Mode name for the given route. A mode name is a human-readable string that more accurately represents what locals call the mode. Ex. : Subway in Montreal is called "Metro".
     */
    mode_name?: string;
    /**
     * Route id used for real time. In most case, it is the case id coming from the original GTFS. If no real time is present, `null` is provided.
     *
     * Not included in the `nearby_stops` call.
     */
    real_time_route_id?: string;
};

