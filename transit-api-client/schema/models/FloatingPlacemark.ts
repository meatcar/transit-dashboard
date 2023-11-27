/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { VehicleType } from './VehicleType';

export type FloatingPlacemark = {
    /**
     * Human readable description of the vehicle
     */
    title?: string;
    /**
     * External identifier from micromobility data provider
     */
    id?: string;
    /**
     * Name of the operator of the network (ie Lyft, CoGo)
     */
    networkName?: string;
    /**
     * Unique identifier for the network (ie Lyft in Los Angeles, CoGo in Columbus)
     */
    networkId?: number;
    /**
     * Main brand color of the network in hex format (no leading #)
     */
    color?: string;
    /**
     * Contrasting color for use over the brand color in hex format (no leading #)
     */
    textColor?: string;
    /**
     * Latitude of the vehicle
     */
    latitude?: number;
    /**
     * Longitude of the vehicle
     */
    longitude?: number;
    type?: VehicleType;
};

