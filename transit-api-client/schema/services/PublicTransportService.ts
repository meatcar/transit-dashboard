/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GlobalRouteId } from '../models/GlobalRouteId';
import type { GlobalStopId } from '../models/GlobalStopId';
import type { ItineraryDetail } from '../models/ItineraryDetail';
import type { LocationType } from '../models/LocationType';
import type { NetworkId } from '../models/NetworkId';
import type { Route } from '../models/Route';
import type { RouteType } from '../models/RouteType';
import type { Stop } from '../models/Stop';
import type { TripSearchKey } from '../models/TripSearchKey';
import type { VertexType } from '../models/VertexType';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PublicTransportService {

    /**
     * Get transit stops which are near a location
     * Returns stops around a location
     * @param lat Latitude
     * @param lon Longitude
     * @param maxDistance Maximum radius of search from the request location (in meters)
     * @param stopFilter Determines which location types from the [GTFS](https://developers.google.com/transit/gtfs/reference#stopstxt) are included in the response.
     * * Routable (GTFS `location_type` 0): Stops which are served by routes
     * * EntrancesAndStopsOutsideStations: Entrances to transit stations and freestanding outdoor stops
     * * Entrances (GTFS `location_type` 2): Entrances to stations
     * * Any: All stops
     *
     * @param pickupDropoffFilter For routable stops, futher filter based on whether a rider can embark or disembark at this stop.
     * * `PickupAllowedOnly`: Riders can board at this stop on at least one trip.
     * * `DropoffAllowedOnly`: Riders can exit at this stop on at least one trip.
     * * `Everything`: All stops.
     *
     * For further reference, see the [GTFS pickup_type and drop_off_type fields](https://developers.google.com/transit/gtfs/reference#stop_timestxt).'
     *
     * @param acceptLanguage Names and other strings can translated into any of the supported languages of a feed. If not provided, the default language of the feed is selected.
     * @returns any List of nearby stops
     * @throws ApiError
     */
    public static nearbyStops(
        lat: number,
        lon: number,
        maxDistance: number = 150,
        stopFilter: 'Routable' | 'EntrancesAndStopsOutsideStations' | 'Entrances' | 'Any' = 'Routable',
        pickupDropoffFilter?: 'PickupAllowedOnly' | 'DropoffAllowedOnly' | 'Everything',
        acceptLanguage?: string,
    ): CancelablePromise<{
        stops?: Array<Stop>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/public/nearby_stops',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            query: {
                'lat': lat,
                'lon': lon,
                'max_distance': maxDistance,
                'stop_filter': stopFilter,
                'pickup_dropoff_filter': pickupDropoffFilter,
            },
            errors: {
                400: `Latitude or longitude is invalid or missing`,
                500: `Internal server error causing no result`,
            },
        });
    }

    /**
     * Get upcoming departures for all routes serving a stop
     * Get upcoming departures for all routes serving a stop, with optional real time information.
     * @param globalStopId A global stop ID, representing a routable stop. Usually this value will be reused from a previous call (ex : nearby_stops)
     * @param time UNIX timestamp representing the time for which departures should be determined
     * @param removeCancelled Remove cancelled schedule items from the results
     * @param acceptLanguage Names and other strings can translated into any of the supported languages of a feed. If not provided, the default language of the feed is selected.
     * @param shouldUpdateRealtime Boolean telling the system if it should update real time or just return schedule information.
     * @returns any List of upcoming departures at stop, grouped by route, then by itinerary
     * @throws ApiError
     */
    public static stopDepartures(
        globalStopId: string,
        time: number = The current time when the request was issued,
        removeCancelled: boolean = false,
        acceptLanguage?: string,
        shouldUpdateRealtime: boolean = "true",
    ): CancelablePromise<{
        route_departures?: Array<Route>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/public/stop_departures',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            query: {
                'global_stop_id': globalStopId,
                'time': time,
                'remove_cancelled': removeCancelled,
                'should_update_realtime': shouldUpdateRealtime,
            },
            errors: {
                400: `Invalid global stop ID or no result could be found`,
            },
        });
    }

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
     * Get a list of available networks
     * List of networks available in the entire Transit system. For more information about networks, refer to the /public/stop_departures endpoint and the 'route_network_name'. Optionnaly, a lat/lon can be passed to filter networks to only the ones that support that coordinate.
     * @param lat Optional latitude, if provided in addition to `lon` the network returned will only include networks serving that location.
     * @param lon Optional longitude, if provided in addition to `lat` the network returned will only include networks serving that location.
     * @param includeAllNetworks Include additional supported networks that are filtered out by default. For example, these may include school busses and previews of upcoming agency network redesigns.
     * @param acceptLanguage Names and other strings can translated into any of the supported languages of a feed. If not provided, the default language of the feed is selected.
     * @returns any OK
     * @throws ApiError
     */
    public static getPublicAvailableNetworks(
        lat?: number,
        lon?: number,
        includeAllNetworks: boolean = false,
        acceptLanguage?: string,
    ): CancelablePromise<{
        networks: Array<{
            /**
             * GeoJSON (of type Polygon or MultiPolygon) representing the service provided by the network.
             */
            network_geometry: Record<string, any>;
            network_id: NetworkId;
            /**
             * Name of the network.
             */
            network_name: string;
            /**
             * Region in which the network is located
             */
            network_location: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/public/available_networks',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            query: {
                'lat': lat,
                'lon': lon,
                'include_all_networks': includeAllNetworks,
            },
        });
    }

    /**
     * Get detail for a route
     * Get detailed information like shape and itineraries for a route
     * @param globalRouteId Global route id provided by other endpoint on which more detail is requested.
     * @param acceptLanguage Names and other strings can translated into any of the supported languages of a feed. If not provided, the default language of the feed is selected.
     * @param includeNextDeparture If set to true, will make the stop list include the next departure for each stop.
     * @returns any OK
     * @throws ApiError
     */
    public static getPublicRouteDetails(
        globalRouteId: string,
        acceptLanguage?: string,
        includeNextDeparture: boolean = false,
    ): CancelablePromise<{
        itineraries: Array<ItineraryDetail>;
        route: Route;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/public/route_details',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            query: {
                'global_route_id': globalRouteId,
                'include_next_departure': includeNextDeparture,
            },
            errors: {
                400: `Unknown route`,
            },
        });
    }

    /**
     * Routes for a given network
     * Return all the routes for a given network.
     * @param networkId Network ID or Network Location provided from [`/public/available_networks`](#operation/get-public-available_networks)
     * @param lat Any lat of a location that serves that network. If provided, the performance of this call will be improved.
     * @param lon Any lon of a location that serves that network. If provided, the performance of this call will be improved.
     * @param acceptLanguage Names and other strings can translated into any of the supported languages of a feed. If not provided, the default language of the feed is selected.
     * @returns any OK
     * @throws ApiError
     */
    public static getPublicRoutesForNetwork(
        networkId?: string,
        lat?: number,
        lon?: number,
        acceptLanguage?: string,
    ): CancelablePromise<{
        routes?: Array<Route>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/public/routes_for_network',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            query: {
                'network_id': networkId,
                'lat': lat,
                'lon': lon,
            },
            errors: {
                400: `Unknown network`,
            },
        });
    }

    /**
     * Stops for a given network
     * Return all the stops for a given network.
     * @param networkId Network ID or Network Location provided from [`/public/available_networks`](#operation/get-public-available_networks)
     * @param lat Any lat of a location that serves that network. If provided, the performance of this call will be improved.
     * @param lon Any lon of a location that serves that network. If provided, the performance of this call will be improved.
     * @param acceptLanguage Names and other strings can translated into any of the supported languages of a feed. If not provided, the default language of the feed is selected.
     * @returns any OK
     * @throws ApiError
     */
    public static getPublicStopsForNetwork(
        networkId?: string,
        lat?: number,
        lon?: number,
        acceptLanguage?: string,
    ): CancelablePromise<{
        stops?: Array<Stop>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/public/stops_for_network',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            query: {
                'network_id': networkId,
                'lat': lat,
                'lon': lon,
            },
            errors: {
                400: `Unknown network`,
            },
        });
    }

    /**
     * Latest data update for network
     * Return the time of the most recent data update for a given network ID or network location
     * @param networkId Network ID or Network Location provided from [`/public/available_networks`](#operation/get-public-available_networks)
     * @param lat Any lat of a location that serves that network. If provided, the performance of this call will be improved.
     * @param lon Any lon of a location that serves that network. If provided, the performance of this call will be improved.
     * @returns any OK
     * @throws ApiError
     */
    public static getPublicLatestUpdateForNetwork(
        networkId?: string,
        lat?: number,
        lon?: number,
    ): CancelablePromise<{
        /**
         * UNIX time in seconds
         */
        time?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/public/latest_update_for_network',
            query: {
                'network_id': networkId,
                'lat': lat,
                'lon': lon,
            },
            errors: {
                400: `Unknown network`,
            },
        });
    }

    /**
     * Find transit stops by search term
     * Given coordinates of an approximate area to search, find transit stops whose names or stop codes match the given search term, from feeds which serve the search area.
     * @param lat Latitude of the approximate area of the search.
     * @param lon Longitude of the approximate area of the search.
     * @param query Search term. Will be matched against the `stop_name` and `stop_code` of potential stops from the [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt).
     * @param pickupDropoffFilter For routable stops, futher filter based on whether a rider can embark or disembark at this stop.
     * * `PickupAllowedOnly`: Riders can board at this stop on at least one trip.
     * * `DropoffAllowedOnly`: Riders can exit at this stop on at least one trip.
     * * `Everything`: All stops.
     *
     * For further reference, see the [GTFS pickup_type and drop_off_type fields](https://developers.google.com/transit/gtfs/reference#stop_timestxt).'
     *
     * @param maxNumResults Maximum number of results to return. If there are few matches, less results than requested will be returned.
     * @param acceptLanguage Names and other strings can translated into any of the supported languages of a feed. If not provided, the default language of the feed is selected.
     * @returns any OK
     * @throws ApiError
     */
    public static getPublicSearchStops(
        lat?: number,
        lon?: number,
        query?: string,
        pickupDropoffFilter?: 'PickupAllowedOnly' | 'DropoffAllowedOnly' | 'Everything',
        maxNumResults?: number,
        acceptLanguage?: string,
    ): CancelablePromise<{
        results: Array<{
            global_stop_id: GlobalStopId;
            location_type: LocationType;
            /**
             * Higher numbers indicate better matches for the search term
             */
            match_strength: number;
            parent_station_global_stop_id: GlobalStopId;
            route_type: RouteType;
            /**
             * Latitude of the stop
             */
            stop_lat: number;
            /**
             * Longitude of the stop
             */
            stop_lon: number;
            /**
             * Stop name from the [GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt)
             */
            stop_name: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/public/search_stops',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            query: {
                'lat': lat,
                'lon': lon,
                'query': query,
                'pickup_dropoff_filter': pickupDropoffFilter,
                'max_num_results': maxNumResults,
            },
            errors: {
                400: `lat, lon or query are missing`,
            },
        });
    }

    /**
     * Get details for a trip.
     * Provides scheduled times and stop information for an entire trip
     * @param tripSearchKey A trip identifier obtained from other endpoints like `/v3/public/stop_departures`. This value will frequently change as feeds are updated and should be refetched regularly before use in further requests.
     * @param acceptLanguage Names and other strings can translated into any of the supported languages of a feed. If not provided, the default language of the feed is selected.
     * @returns any OK
     * @throws ApiError
     */
    public static getV3PublicTripDetails(
        tripSearchKey: string,
        acceptLanguage?: string,
    ): CancelablePromise<{
        route: Route;
        /**
         * A identifier for that trip. In the majority of cases, it will be the same `trip_id` found from the original GTFS. Note that two departures can have the same `rt_trip_id` if one of them has been duplicated by real time data. Can be empty string if no trip id is provided.
         */
        rt_trip_id: string;
        /**
         * The departure time and information about each stop of the trip.
         */
        schedule_items: Array<{
            /**
             * Time of departure at this stop, in UNIX time in seconds.
             */
            departure_time: number;
            stop?: Stop;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v3/public/trip_details',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            query: {
                'trip_search_key': tripSearchKey,
            },
        });
    }

}
