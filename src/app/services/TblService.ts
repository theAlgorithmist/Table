/** 
 * Copyright 2016 Jim Armstrong (www.algorithmist.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Table service class - get the table data from a file
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

 import { Observable } from "RxJs";
 import { Http } from 'angular2/http';
 import { Inject } from 'angular2/core';
 
 import 'rxjs/add/operator/map';

 export class TblService 
 {
   private _header:Array<String>;
   private _table:Array<Array<any>>;
   private _http:Http;

  /**
   * Construct a new TblService
   *
   * @param http: Http - Http instance used to retrieve data from a supplied url
   *
   * @return Nothing - Since this service will itself be injected, the constructor argument must be annotated as injectable
   */
   constructor( @Inject(Http) http:Http ) 
   {
     this._header = new Array<String>();
     this._table  = new Array<Array<any>>();

     this._http = http;
   }
  
  /**
   * Retrieve table data from the supplied url
   *
   * @param serviceURL: string - URL for the table data
   *
   * @return Observable - Observable stream
   */
   public getData( serviceURL:string ): Observable<any>
   { 
     return this._http.get(serviceURL)
       .map( (responseData:any) => {
       return responseData.json();
     });
   }
 }