/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type StationPlacemark = {
    /**
     * Description of the location of the docking station (ie High St / Warren)
     */
    title?: string;
    /**
     * Human readable description of vehicles available
     */
    subtitle?: string;
    /**
     * External identifier from micromobility data provider
     */
    id?: string;
    /**
     * Name of the operator of the network
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
     * Latitude of the station
     */
    latitude?: number;
    /**
     * Longitude of the station
     */
    longitude?: number;
    type?: StationPlacemark.type;
};

export namespace StationPlacemark {

    export enum type {
        STATION = 'station',
    }


}

