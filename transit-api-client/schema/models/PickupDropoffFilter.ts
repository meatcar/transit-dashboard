/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * For routable stops, futher filter based on whether a rider can embark or disembark at this stop.
 * * `PickupAllowedOnly`: Riders can board at this stop on at least one trip.
 * * `DropoffAllowedOnly`: Riders can exit at this stop on at least one trip.
 * * `Everything`: All stops.
 *
 * For further reference, see the [GTFS pickup_type and drop_off_type fields](https://developers.google.com/transit/gtfs/reference#stop_timestxt).'
 *
 */
export enum PickupDropoffFilter {
    PICKUP_ALLOWED_ONLY = 'PickupAllowedOnly',
    DROPOFF_ALLOWED_ONLY = 'DropoffAllowedOnly',
    EVERYTHING = 'Everything',
}
