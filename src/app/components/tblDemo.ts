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
 * 2D Table Analysis Demo
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */
 import { Component } from 'angular2/core';
 import { TblService } from '../services/TblService';
 import { TSMT$Table } from '../lib/Table';
 import { TableTypeEnum } from '../lib/Table';

 @Component(
 {
   selector: 'tbl-demo',

   templateUrl: '/app/templates/main.html'
 })

 // This is the host component for the table demo
 export class TblDemoComponent 
 {
   private _data: Object;                  // direct reference to the JSON data returned by the service
   
   private _header:Array<string>           // column headers
   
   private _tableData: Array<Array<any>>;  // 2D table of arbitrary data, most likely mix of string and numeric columns

   private _table: TSMT$Table;             // Typescript Math Toolkit Table

   private _loading: boolean = false;      // true if data load is in progress

   // table analysis
   private _visible: boolean = false;      // true if table data section is visible
   private _quartile: Array<number>;       // price quantile (n=4)
   private _quintile: Array<number>;       // price quantile (n=5)
   private _priceMean: number;             // mean car price
   private _priceStd: number;              // car price std. dev.
   private _itemCounts: Array<Object>;     // array of unique item names and corresponding counts in model-year (one-way) analysis

   // cross-table analysis.  For demo purposes, we take advantage of advance knowledge of the number of rows and columns.  In production,
   // this would be a good use-case for a data grid :)
   private _tableChi2: number;             // total table chi-2 value
   private _observations: number;          // total number of samples or observations
   private _tblRows: Array<Object>;        // result of pre-processing results of cross-tab analysis to make everything work nicely with ngFor and the template
   private _colCount1: number;
   private _colCount2: number;

  /**
   * Create a new table demo component
   *
   * @param 
   *
   * @return nothing This is the root component of the table demo. 
   */
   constructor( private _service:TblService )
   {
     this._table   = new TSMT$Table();
     this._tblRows = new Array<Object>();
   }

  /**
   * Fetch external data and handle the return from an external service
   *
   * @return Nothing - The JSON data is returned from a hardcoded URI, which is a file in this demo
   */
   public onGetData():void
   { 
     if( !this._loading ) 
     {
       this._loading = true;  // crude way to handle multiple clicks on get-data button

       // get the data and subscribe to the returned Observable
       this._service.getData("/app/data/tbl.json").subscribe(
         (returnData) => {
           this._data = JSON.parse(JSON.stringify(returnData));

           // extract relevant data items
           this._header = this._data["header"].slice();
           this._tableData = this._data["data"].slice();

           // 2D table analysis
           this.__analysis();
         },

         () => console.log('error loading data ...'),  // highly sophisticated error handler :)

         (() => this._visible = true)                  // data load complete
       )
     }
   }

   // perform the 2D crosstab analysis and update the UI
   private __analysis():void
   {
     // the header and table data need to be concatenated before initialzing the TSMT Table
     this._tableData.unshift(this._header);

     // specify the data types for each column - in production, these would likely be passed along with the actual data
     var types:Array<number> = Array<number>( TableTypeEnum.NUMERIC 
                                             ,TableTypeEnum.CHARACTER
                                             ,TableTypeEnum.NUMERIC
                                             ,TableTypeEnum.NUMERIC
                                             ,TableTypeEnum.CHARACTER
                                             ,TableTypeEnum.CHARACTER );

     // init the table
     this._table.fromArray(this._tableData, types);

     // quartile (quantile, n=4) [3800, 10995, 13951.5, 14904.5, 21992]
     this._quartile = this._table.getQuantiles("price", 0.25);

     // quintile (quantile n=5) [3800, 10759.4, 12993.8, 13992, 14999, 21992]
     this._quintile = this._table.getQuantiles("price", 0.2);

     // mean and std. dev. of the 'price' column
     this._priceMean = this._table.getMean("price"); // 12961.93
     this._priceStd  = this._table.getStd("price");  // 3122.48

     // one-way analysis of model year (i.e. unique model years and count of each vehicle in that model year)
     let oneWay:Object = this._table.oneWayTable("year");

     // ngFor in A2 does not iterate over object keys (here is a good ref. - https://webcake.co/object-properties-in-angular-2s-ngfor/)
     // Fortunately, the TSMT Table class has something that will help :)
     this._itemCounts = this._table.__tblToArray(oneWay);
    
     // 2000, 3
     // 2001, 1
     // 2002, 1
     // 2003, 1
     // 2204, 3
     // 2005, 2
     // 2006, 6
     // 2007, 11
     // 2008, 14
     // 2009, 42
     // 2010, 49
     // 2011, 16
     // 2012, 1

     // cross-table analysis - group black, silver, white, and gray cars into a 'simple' color.  Group blue, bold, green, red, and yellow
     // colors into a 'bold' color.  Study purchase trends on simple vs. bold coloring

     let crossTable: Object = this._table.crossTable("model", "color", 
                                                     ["Black Silver White Gray", "Blue Gold Green Red Yellow"], 
                                                     ["Simple-Color", "Bold-Color"]);

     // The output table has four columns and number of rows determined by number of unique models (plus one).  Outer column/row is for row/column counts.
     this._tableChi2    = parseFloat(crossTable['chi2']);
     this._observations = parseFloat(crossTable['df']) + 1;

     // this pre-processing helps everything fit neatly into the ngFor world - we know that the 'model' column is string data in advance
     let table: Object = crossTable['table'];

     // make a clean array of output table rows from the result (this is why TSMT does not monkey-patch an Object with an associative array)
     let key: string;
     let rowData: Array<any>;
     let rowCount: number;
     let cell1: Object;
     let cell2: Object;

     // this works because we know the number of columns will be fixed at four - one for the 'model' name, one each for the two characterisitcs 
     // (simple/bold) and one for the row counts.  In the future, I may add this formatting to the TSMT Table - handling the column counts makes
     // formatting the table a bit tricky and settling on a strategy that most everyone likes may take time.
     for( key in table )
     {
       rowData = table[key];
       cell1   = rowData[0];
       cell2   = rowData[1];
 
       this._tblRows.push({ model: key, 
                            c1n: cell1['n'], c1r: cell1['r'], c1t: cell1['t'], 
                            c2n: cell2['n'], c2r: cell2['r'], c2t: cell2['t'], 
                            count: rowData[2] });
     }

     let colCounts: Array<number> = crossTable['colCounts'];

     // assign the column counts (final row of the output cross-table) - there should only be two.
     this._colCount1 = colCounts[0];
     this._colCount2 = colCounts[1];
   }
 }