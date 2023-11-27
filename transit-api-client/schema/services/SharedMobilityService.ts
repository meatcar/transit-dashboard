/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FloatingPlacemark } from '../models/FloatingPlacemark';
import type { GlobalRouteId } from '../models/GlobalRouteId';
import type { GlobalStopId } from '../models/GlobalStopId';
import type { StationPlacemark } from '../models/StationPlacemark';
import type { TripSearchKey } from '../models/TripSearchKey';
import type { VertexType } from '../models/VertexType';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SharedMobilityService {

    /**
     * Plan a trip from origin to destination
     * Except as noted, the API is compatible with the OpenTripPlanner API.
     * For additional information, you may refer to <http://dev.opentripplanner.org/apidoc/2.0.0/resource_PlannerResource.html>.
     *
     * @param fromPlace Originating location for the trip.
     * * Simple lat/lon pair (e.g. `40.714476,-74.005966`)
     * * Lat/lon pair with label (e.g. `289 Broadway::40.714476,-74.005966`)
     *
     * @param toPlace Destination location for the trip.
     * * Simple lat/lon pair (e.g. `40.714476,-74.005966`)
     * * Lat/lon pair with label (e.g. `289 Broadway::40.714476,-74.005966`)
     *
     * @param arriveBy Selects 'leave after' or 'arrive by' planning.
     *
     * | Case    |  Description                           |
     * |---------|----------------------------------------|
     * | `false` | Trip departs after `date` and `time`.  |
     * | `true`  | Trip arrives before `date` and `time`. |
     *
     * @param date Date of departure or arrival. Must be in UTC.
     * @param time Time of departure or arrival. Must be in UTC.
     * @param mode The following combinations of mode are currently supported.
     * <div class='wide-table'>
     *
     * | 1st Mode                | 2nd Mode                             | Description                      |
     * |-------------------------|--------------------------------------|----------------------------------|
     * | `TRANSIT`               | `WALK`                               | Use transit only. (default)      |
     * | `BICYCLE`               | *(none)*                             | Use personal bike only.          |
     * | `WALK`                  | *(none)*                             | Walk only.                       |
     * | `MICROTRANSIT`          | *(none)*                             | Use on-demand public transit services only. |
     * | `TRANSIT`               | `BICYCLE_FirstLeg` or `BICYCLE`      | Use personal bike for first leg, transit for rest of trip. |
     * | `TRANSIT`               | `BICYCLE_LastLeg`                    | Use personal bike for last leg, transit for rest of trip. |
     * | `TRANSIT`               | `BICYCLE_FirstAndLastLegs`           | Use personal bike for the first and/or last legs of trip, transit for the remaining legs. |
     * | `TRANSIT`               | `BICYCLE_RENT`                       | Use bikeshare for the first and/or last legs of trip, transit for the remaining legs. Docked and dockless bikes, as well as scooters are included. |
     * | `TRANSIT`               | `BICYCLE_RENT_Bikeshare`             | Use docked bikes for first and/or last legs of trip. |
     * | `TRANSIT`               | `BICYCLE_RENT_DocklessBikes`         | Use dockless bikes for the first and/or last legs of trip. |
     * | `TRANSIT`               | `BICYLCE_RENT_ElectricScooter`       | Use scooters for the first and/or last legs of trip. |
     * | `TRANSIT`               | `MICROTRANSIT`                       | Use on-demand public transit services for the first and/or last legs of the trip, and scheduled services for the remaining legs. |
     *
     * </div>
     * <style>
     * code { word-break: keep-all !important; whitespace: pre !important; }
     * .wide-table table td, .wide-table table th { display: inline-block; width: 40%; border: 0}
     * .wide-table table td:nth-child(3), .wide-table table th:nth-child(3) { width: 100% }
     * .wide-table table th:nth-child(3) { visibility: hidden}
     * </style>
     *
     * @param numItineraries The maximum number of possible itineraries to return.
     * @param locale Language to be used for names in response
     * @param walkReluctance Walking is minimized if walkReluctance &geq; 20.0.
     * @param wheelchair Whether the trip must be wheelchair accessible.
     * @param ignoreRealTimeUpdates If false, times within trip plans reflect real-time information if available.
     * @param allowedNetworks If set, only the specified networks will be used to plan trips. A list of available networks can be obtained from [`/public/available_networks`](#operation/get-public-available_networks).
     *
     * This parameter will accept a comma-separated list containing network IDs, network locations or a combination of both.
     * Provides similar functionality to the OTP parameter `whitelistedAgencies`.
     *
     * @param acceptLanguage Names and other strings can translated into any of the supported languages of a feed. If not provided, the default language of the feed is selected.
     * @returns any Except as noted, the API is compatible with the OpenTripPlanner API.
     * Please refer to <http://dev.opentripplanner.org/apidoc/2.0.0/json_TripPlannerResponse.html>.
     *
     * @throws ApiError
     */
    public static otp(
        fromPlace: string,
        toPlace: string,
        arriveBy: boolean = false,
        date: string = 'Current time when request was issued.',
        time: string = 'Current time when request was issued.',
        mode: string = 'TRANSIT,WALK',
        numItineraries: number = 3,
        locale: string = 'en',
        walkReluctance: number = 2,
        wheelchair: boolean = false,
        ignoreRealTimeUpdates: boolean = "false",
        allowedNetworks?: string,
        acceptLanguage?: string,
    ): CancelablePromise<{
        plan: {
            /**
             * Date on which the trip takes place, represented in UNIX time in milliseconds.
             */
            date: number;
            from: {
                lat: number;
                lon: number;
                /**
                 * The name of the transit stop or other point
                 */
                name: string;
                vertexType: VertexType;
            };
            itineraries: Array<{
                /**
                 * Whether the itinerary is accessible to riders in a wheelchair.
                 *
                 * * `None`: Accessible trip not requested.
                 *
                 * * `WheelchairTripsWithUnknownStops`: The trips and routes used are accessible, but the accessibility status of at least one stop in the itinerary is unknown.
                 *
                 * * `WheelchairStrict`: The itinerary is accessible, and all necessary accessibility info was available.
                 */
                accessibility: 'None' | 'WheelchairTripsWithUnknownStops' | 'WheelchairStrict';
                /**
                 * Duration of the itinerary, in seconds
                 */
                duration: number;
                /**
                 * Time at which the last leg of the itinerary ends. Represented as UNIX time, in milliseconds.
                 */
                endTime: number;
                legs?: Array<{
                    /**
                     * Identifies the transit agency or sharing system provider operating the service used for this leg, where applicable.
                     */
                    agencyId?: string;
                    /**
                     * The name of the public transit agency or sharing system provider which operates the service used during this leg, where applicable
                     */
                    agencyName?: string;
                    /**
                     * The difference between the local timezone and UTC at the time of the trip, represented in milliseconds.
                     */
                    agencyTimeZoneOffset?: number;
                    /**
                     * A URL providing information about the transit agency or sharing system provider
                     */
                    agencyUrl?: string;
                    /**
                     * Distance travelled in this leg, in meters
                     */
                    distance: number;
                    /**
                     * Duration of travel in this leg, in seconds
                     */
                    duration: number;
                    /**
                     * Time at which this leg ends, represented in UNIX time in milliseconds.
                     */
                    endTime: number;
                    from?: {
                        lat: number;
                        lon: number;
                        /**
                         * The name of the transit stop ([GTFS stop_name](https://developers.google.com/transit/gtfs/reference#stopstxt)), or other point
                         */
                        name?: string;
                        /**
                         * For transit stops, `stop_code` from the [GTFS](https://developers.google.com/transit/gtfs/reference#stopstxt)
                         */
                        stopCode?: string;
                        /**
                         * Correlates with real-time data when available
                         */
                        stopId?: string;
                        globalStopId?: GlobalStopId;
                        /**
                         * For transit stops: Represents the order of the stop within the GTFS trip. For example, stopIndex = 2 means that the bus was boarded at the 3rd stop of the trip.
                         */
                        stopIndex?: number;
                        vertexType: VertexType;
                    };
                    /**
                     * For transit legs, The text nominally displayed on the vehicle servicing the journey, which describes the route, destination, etc. See documentation for [GTFS trip_headsign](https://developers.google.com/transit/gtfs/reference#tripstxt) for further information.
                     */
                    headsign?: string;
                    /**
                     * A list of all the stops the rider will pass through on this leg without embarking or disembarking the vehicle.
                     */
                    intermediateStops?: Array<{
                        lat: number;
                        lon: number;
                        /**
                         * `stop_name` from the [GTFS](https://developers.google.com/transit/gtfs/reference#stopstxt)
                         */
                        name: string;
                        /**
                         * `stop_code` from the [GTFS](https://developers.google.com/transit/gtfs/reference#stopstxt)
                         */
                        stopCode: string;
                        /**
                         * Correlates with real-time data when available
                         */
                        stopId: string;
                        globalStopId?: GlobalStopId;
                        /**
                         * Represents the order of the stop within the GTFS trip. For example, stopIndex = 5 means that rider should remain on the bus through the 6th stop of the trip.
                         */
                        stopIndex: number;
                        vertexType: VertexType;
                    }>;
                    /**
                     * A shape representing the path travelled along this leg
                     */
                    legGeometry?: {
                        /**
                         * Number of vertices encoded in points
                         */
                        length: number;
                        /**
                         * A Polyline. The format is specified in <https://developers.google.com/maps/documentation/utilities/polylinealgorithm>
                         */
                        points: string;
                    };
                    /**
                     * The mode used for this leg. A public transit mode will be denoted with a specific vehicle type if applicable (e.g. BUS) or TRANSIT for other types.
                     */
                    mode: 'TRANSIT' | 'WALK' | 'BICYCLE' | 'BICYCLE_RENT' | 'TRAM' | 'BUS' | 'RAIL' | 'SUBWAY' | 'FERRY' | 'GONDOLA';
                    /**
                     * Alias of `routeShortName`
                     */
                    route?: string;
                    /**
                     * `route_color` from the [GTFS](https://developers.google.com/transit/gtfs/reference#routestxt)
                     */
                    routeColor?: string;
                    /**
                     * Correlates with real-time data when available.
                     */
                    routeId?: string;
                    globalRouteId?: GlobalRouteId;
                    /**
                     * For transit legs, `route_long_name` from the [GTFS](https://developers.google.com/transit/gtfs/reference#routestxt)
                     */
                    routeLongName?: string;
                    /**
                     * For transit legs, `route_short_name` from the [GTFS](https://developers.google.com/transit/gtfs/reference#routestxt)
                     */
                    routeShortName?: string;
                    /**
                     * `route_text_color` from the [GTFS](https://developers.google.com/transit/gtfs/reference#routestxt)
                     */
                    routeTextColor?: string;
                    /**
                     * For transit legs, `route_type` from the [GTFS](https://developers.google.com/transit/gtfs/reference#routestxt)
                     */
                    routeType?: number;
                    /**
                     * Time at which this leg begins, represented in UNIX time in milliseconds
                     */
                    startTime: number;
                    to?: {
                        lat: number;
                        lon: number;
                        /**
                         * The name of the transit stop ([GTFS stop_name](https://developers.google.com/transit/gtfs/reference#stopstxt)), or other point
                         */
                        name?: string;
                        /**
                         * For transit stops, `stop_code` from the [GTFS](https://developers.google.com/transit/gtfs/reference#stopstxt)
                         */
                        stopCode?: string;
                        /**
                         * Correlates with real-time data when available
                         */
                        stopId?: string;
                        globalStopId?: GlobalStopId;
                        /**
                         * For transit stops, represents the order of the stop within a GTFS trip. For example stop_index = 20, means that the user should disembark at the 21st stop of the bus' trip.
                         */
                        stopIndex?: number;
                        vertexType: VertexType;
                    };
                    /**
                     * True if travelling by public transit, false for all other modes
                     */
                    transitLeg?: boolean;
                    /**
                     * `block_id` from the [GTFS](https://developers.google.com/transit/gtfs/reference#tripstxt) if applicable for this leg.
                     */
                    tripBlockId?: string;
                    /**
                     * Correlates with real-time data where available
                     */
                    tripId?: string;
                    /**
                     * `trip_short_name` from the [GTFS](https://developers.google.com/transit/gtfs/reference#tripstxt). Generally used for train numbers on commuter rail.
                     */
                    tripShortName?: string;
                    tripSearchKey?: TripSearchKey;
                    /**
                     * For transit legs. True if an in-seat transfer / trip continuation has occured. The rider may remain onboard while the vehicle now operates on another route.
                     */
                    interlineWithPreviousLeg?: boolean;
                    /**
                     * True if startTime and endTime for this leg are based on real-time information.
                     */
                    realTime?: boolean;
                    /**
                     * Delay between the scheduled and real-time startTimes, in seconds. If positive, the vehicle is late, and if negative, the vehicle is early.
                     */
                    departureDelay?: number;
                    /**
                     * Delay between the scheduled and real-time arrival of the vehicle. This value is currently always identical to departureDelay
                     */
                    arrivalDelay?: number;
                }>;
                /**
                 * The time at which the first leg of the itinerary begins. Represented as UNIX time in milliseconds.
                 */
                startTime: number;
                /**
                 * The number of times the user must disembark one transit vehicle and board another during this itinerary.
                 */
                transfers: number;
                /**
                 * Total time in seconds spent on a transit vehicle.
                 */
                transitTime: number;
                /**
                 * Total time in seconds spent walking
                 */
                walkTime: number;
                /**
                 * Reflects the requested trip accessibility:
                 *
                 * * `None`: Include all trips
                 *
                 * * `WheelchairTripsWithUnknownStops`:  Require accessible trips, but include trips using stops with unknown accessibility status.
                 */
                wheelchairNeed: string;
            }>;
            to: {
                lat: number;
                lon: number;
                /**
                 * The name of the transit stop or other point
                 */
                name: string;
                vertexType: VertexType;
            };
        };
        /**
         * Details on transfer time between stops. Only useful if you want to re-calculate the trip using new schedule.
         */
        transfers: {
            bufferTime: number;
            defaultMinimumTime: number;
            minimumTimes: Array<{
                fromFeedId: number;
                fromStopId: number;
                minTime: number;
                toFeedId: number;
                toStopId: number;
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/otp/plan',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            query: {
                'arriveBy': arriveBy,
                'date': date,
                'time': time,
                'mode': mode,
                'fromPlace': fromPlace,
                'numItineraries': numItineraries,
                'toPlace': toPlace,
                'locale': locale,
                'walkReluctance': walkReluctance,
                'wheelchair': wheelchair,
                'ignoreRealTimeUpdates': ignoreRealTimeUpdates,
                'allowedNetworks': allowedNetworks,
            },
        });
    }

    /**
     * Get a list of placemarks
     * Returns placemarks for a location. Placemarks include bikeshare system docks, scooters and other shared systems.
     * @param lat Latitude
     * @param lon Longitude
     * @param distance Distance in meters (as the bird flies).
     * @returns any A list of nearby placemarks
     * @throws ApiError
     */
    public static getPlacemarks(
        lat: number,
        lon: number,
        distance: number = 100,
    ): CancelablePromise<{
        placemarks?: Array<(FloatingPlacemark | StationPlacemark)>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/map_layers/placemarks',
            query: {
                'lat': lat,
                'lon': lon,
                'distance': distance,
            },
            errors: {
                400: `Unable to process location or distance`,
                404: `No placemarks were found near the requested location`,
            },
        });
    }

    /**
     * Get a list of available sharing system networks
     * List of sharing system networks available in the entire Transit system.
     * @returns any OK
     * @throws ApiError
     */
    public static getSharingSystemAvailableNetworks(): CancelablePromise<{
        networks?: Array<{
            /**
             * GeoJSON (of type Polygon) representing the service provided by the network.
             */
            network_geometry?: Record<string, any>;
            /**
             * Identifier of the network.
             */
            network_id?: number;
            /**
             * Name of the network.
             */
            network_name?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/map_layers/available_networks',
        });
    }

}
