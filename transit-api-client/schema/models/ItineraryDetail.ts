/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DirectionId } from './DirectionId';
import type { ScheduleItem } from './ScheduleItem';
import type { Stop } from './Stop';

export type ItineraryDetail = {
    /**
     * Direction headsign that represent the overall direction of the trip. Ex : "Northbound".
     */
    direction_headsign?: string;
    direction_id: DirectionId;
    /**
     * The headsign from the GTFS. Refer to the [trip_headsign](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt) for more information.
     */
    headsign: string;
    /**
     * Headsign merging both regular and direction headsign in a single string for display. Ex "Northbound to downtown center" when "Northbound" is the direction headsign and "Downtown center" is the regular headsign.
     */
    merged_headsign?: string;
    /**
     * Shape provided in the [encoded polyline format](https://developers.google.com/maps/documentation/utilities/polylinealgorithm). If no shape is provided, null will be returned.
     */
    shape?: string;
    stops: Array<Stop>;
    next_departure?: ScheduleItem;
    /**
     * If true, it means that itinerary is considered one of the main itinerary for that route. If false, it's recommended to not show that itinerary in a context where all the itineraries are shown.
     */
    canonical_itinerary?: boolean;
    /**
     * Set to True if there are any departure in the next 24h.
     */
    is_active?: boolean;
};

