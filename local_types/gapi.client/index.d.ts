// Type definitions for Google API client 1.0
// Project: https://developers.google.com
// Definitions by: Bolisov Alexey <https://github.com/Bolisov>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

declare namespace gapi {
    /**
     * Pragmatically initialize gapi class member.
     */
    function load(api: string, callback: () => void | LoadCallback): void;
    interface LoadCallback {
        callback(): void;
        onerror?(): void;
        timeout?: number;
        ontimeout?(): void;
    }

    namespace client {
        function init(args: InitArgs): Promise<any>;
        interface InitArgs {
            apiKey?: string;
            discoveryDocs?: string[];
            clientId?: string;
            scope?: string;
        }
        /**
         * Loads the client library interface to a particular API. The new API interface will be in the form gapi.client.api.collection.method.
         * @param name The name of the API to load.
         * @param version The version of the API to load
         * @param callback the function that is called once the API interface is loaded
         */
        function load(urlOrObject: string): PromiseLike<any>;
        function load(name: string, version: string, callback?: () => any): void;
        function load(name: string, version: string): PromiseLike<void>;

        /**
         * Creates a HTTP request for making RESTful requests.
         * An object encapsulating the various arguments for this method.
         */
        function request<T>(args: {
            /**
             * The URL to handle the request
             */
            path: string;
            /**
             * The HTTP request method to use. Default is GET
             */
            method?: Method;
            /**
             * URL params in key-value pair form
             */
            params?: {[key: string]: any};
            /**
             * Additional HTTP request headers
             */
            headers?: {[key: string]: string};
            /**
             * The HTTP request body (applies to PUT or POST).
             */
            body?: any;
            // /**
            //  * If supplied, the request is executed immediately and no gapi.client.HttpRequest object is returned
            //  */
            // callback?: () => any;
        }): Request<T>;
        type Method = "GET" | "POST" | "PUT" | "DELETE";

        /**
         * Sets the API key for the application.
         * @param apiKey The API key to set
         */
        function setApiKey(apiKey: string): void;

        /**
         * Sets the authentication token to use in requests. This should be used if the token was obtained without using the gapi.auth2 authentication library (for instance, when using Firebase to authenticate users).
         * @param tokenObject An object containing the access_token to use in API requests.
         */
        function setToken(tokenObject: TokenObject): void;
        interface TokenObject {
            access_token: string; /// The access token granted to the user.
        }

        /**
         * An object containing information about the HTTP response
         */
        interface Response<T> {
            // The JSON-parsed result.
            result: T;

            // The raw response string.
            body: string;

            // The map of HTTP response headers.
            headers?: any[];

            // HTTP status
            status?: number;

            // HTTP status text
            statusText?: string;
        }

        /**
         * An object encapsulating an HTTP request. This object is not instantiated directly, rather it is returned by gapi.client.request.
         */
        interface Request<T> extends PromiseLike<Response<T>> {
            /**
             * Executes the request and runs the supplied callback on response.
             * @param callback The callback function which executes when the request succeeds or fails.
             */
            execute(callback: (
                /**
                 * contains the response parsed as JSON. If the response is not JSON, this field will be false.
                 */
                response: Response<T>,
                rawResponse: any
            ) => any): void;
        }

        interface ResponseMap<T> {
            [id: string]: Response<T>;
        }

        /**
         * Represents an HTTP Batch operation. Individual HTTP requests are added with the add method and the batch is executed using execute.
         */
        interface Batch<T> extends PromiseLike<Response<ResponseMap<T>>> {
            /**
             * Adds a gapi.client.Request to the batch.
             * @param request The HTTP request to add to this batch.
             * @param opt_params extra parameters for this batch entry.
             */
            add<T>(request: Request<T>, opt_params?: {
                /**
                 * Identifies the response for this request in the map of batch responses. If one is not provided, the system generates a random ID.
                 */
                id: string;
                opt_params: {
                    id?: string;
                    callback?(
                        /**
                         * is the response for this request only. Its format is defined by the API method being called.
                         */
                        individualResponse: Response<T>,
                        /**
                         * is the raw batch ID-response map as a string. It contains all responses to all requests in the batch.
                         */
                        rawBatchResponse: string
                    ): any;
                }
            }): void;
            /**
             * Executes all requests in the batch. The supplied callback is executed on success or failure.
             * @param callback The callback to execute when the batch returns.
             */
            execute(callback: (
                /**
                 * is an ID-response map of each requests response.
                 */
                responseMap: ResponseMap<T>,
                /**
                 * is the same response, but as an unparsed JSON-string.
                 */
                rawBatchResponse: string
            ) => any): void;
        }

        /**
         * Creates a batch object for batching individual requests.
         */
        function newBatch<T>(): Batch<T>;
    }

    namespace auth2 {
        /**
         * The OAuth 2.0 token object represents the OAuth 2.0 token and any associated data.
         */
        interface GoogleApiOAuth2TokenObject {
            /**
             * The OAuth 2.0 token. Only present in successful responses
             */
            access_token: string;
            /**
             * Details about the error. Only present in error responses
             */
            error: string;
            /**
             * The duration, in seconds, the token is valid for. Only present in successful responses
             */
            expires_in: string;
            /**
             * The Google API scopes related to this token
             */
            state: string;
        }

        function init(params: Configuration): GoogleAuth;
        interface Configuration {
            client_id: string;
            cookie_policy?: string | "single_host_origin" | "none";
            scope?: string;
            fetch_basic_profile?: boolean;
            hosted_domain?: string;
            openid_realm?: string;
            ux_mode?: string;
            redirect_uri?: string;
        }

        const ClientConfig: Configuration;

        function getAuthInstance(): GoogleAuth;

        interface GoogleAuth extends PromiseLike<void> {
            isSignedIn: {
                get(): boolean;
                listen(listener: (signed: boolean) => void): void;
            }

            signIn(option?: SignInOption): PromiseLike<GoogleUser>;
            signOut(): PromiseLike<void>;
            disconnect(): void;
            grantOfflineAccess(options: OfflineAccessOptions): PromiseLike<any>;
            attachClickHandler(container: HTMLElement, options: SignInOption, onsuccess: () => void, onfailure: () => void): void;

            currentUser: {
                get(): GoogleUser;
                listen(listener: (user: GoogleUser) => void): void;
            }
        }

        interface SignInOption {
            app_package_name?: string;
            fetch_basic_profile?: boolean;
            prompt?: "consent" | "select_account" | "none";
            scope?: string;
            ux_mode?: string;
            redirect_uri?: string;
        }

        interface OfflineAccessOptions {
            app_package_name?: string;
            prompt?: "consent" | "select_account";
            scope?: string;
        }

        interface GoogleUser {
            getId(): string;
            isSignedIn(): boolean;
            getHostedDomain(): string;
            getBasicProfile(): BasicProfile;
            getAuthResponse(includeAuthorizationData?: boolean): AuthResponse;
            reloadAuthResponse(): PromiseLike<AuthResponse>;
            hasGrantedScopes(scopes: string): boolean;
            grant(options: SignInOption): PromiseLike<GoogleUser>;
            grantOfflineAccess(options: OfflineAccessOptions): void;
            disconnect(): void;
        }

        interface AuthResponse {
            access_token: string;
            id_token: string;
            scope: string;
            expires_in: number;
            first_issued_at: number;
            expires_at: number;
        }

        interface BasicProfile {
            getId(): string;
            getName(): string;
            getGivenName(): string;
            getFamilyName(): string;
            getImageUrl(): string;
            getEmail(): string;
        }
    
    }
}
