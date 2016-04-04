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
 * Typescript Math Toolkit:  Some methods for working with tabular data or simple 'data frames' in R lingo. A data table consists of header information, 
 * or category labels, and a 2D set of either character, numerical, or boolean data.  Categories are listed across the first row of the table and each 
 * data point is in a single row underneath each category.  Thus, category data is down columns and must be consistent along each column (i.e. do not 
 * mix numeric and character data in the same column).
 *
 * @author Jim Armstrong (www.algorithmist.net)
 * 
 * @version 1.0
 */

 // NOTE: THIS IS AN ALPHA RELEASE OF THE TYPESCRIPT MATH TOOLKIT TABLE, FOR DEMO PURPOSES.  AS OF RELEASE, THE CHI2 CLASS HAS NOT BEEN COMPLETELY TESTED,
 // SO ALL REFERENCES TO CHI-SQUARE ANALYSIS HAVE BEEN COMMENTED OUT.  THIS VERSION OF THE TABLE CLASS RETURNS ZERO FOR ANY Q-VALUE.
 import {TSMT$DataStats} from './DataStats';
 //import {TSMT$Chi2} from '../Chi2'; 

 export enum TableTypeEnum
 {
   NUMERIC, 
   CHARACTER, 
   BOOLEAN
 }

 export class TSMT$Table
 {
   private __stats: TSMT$DataStats;
    
   //private __chisq: TSMT$Chi2;
 
   private _table: Array<Array<any>>;   // data table (array of arrays, stored column-major)
   private _categories: Array<string>;  // categories (character labels) for each column
   private _types: Array<number>;       // type of each category of data (NUMERIC, CHARACTER, or BOOLEAN)
		
   constructor()
   {
     this.__stats = new TSMT$DataStats();
    
     //this.__chisq = new TSMT$Chi2();

     this._table      = new Array<Array<any>>();
     this._categories = new Array<string>();
     this._types      = new Array<number>();
   }
    
  /**
   * Assign the table from an array of arrays (where the first row ALWAYS contains the category labels)
   * 
   * @param data : Array - Each element is an array containing one row of data and the first row is ALWAYS the category labels
   * 
   * @param dataTypes:Array - One element for each column that indicates the type of data - must be Table.NUMERIC, TABLE.CHARACTER, or TABLE.BOOLEAN.  The
   * number of elements in this array must be the same as the number of elements in the first array of the data parameter
   * 
   * @return Nothing - The internal table is assigned provided that all input is valid
   */
   public fromArray(data: Array<Array<any>>, dataTypes: Array<number>): void
   {
     if( !data || data.length < 2 )
       return;
        
     if( !dataTypes || dataTypes.length == 0 )
       return;
        
     if( data[0].length != dataTypes.length )
       return;
        
     this.__clear();
        
     this._categories = data[0].slice();
     var n: number    = this._categories.length;
        
     this._types = dataTypes.slice();
        
     // initialize each column
     var i: number;
     for( i=0; i<n; ++i )
       this._table[i] = new Array();
        
     // copy the data in, column-major
     var len: number = data.length;
     var j: number;
     var row: Array<number>;

     for( i=1; i<len; ++i )
     {
       row = data[i];
       for( j=0; j<n; ++j )
         this._table[j].push( row[j] );
     }
   }
    
  /**
   * Access the categories or character names assigned to each column of data
   * 
   * @return Array - Array of column names (categories) in order originally input
   */
   public get categories(): Array<string>
   {
     return this._categories.slice();
   }
      
  /**
   * Access the data type of each category
   * 
   * @return Array - Array of data types for each cateogry name in the order originally input - refer to TableTypeEnum.
   */
   public get dataTypes(): Array<number>
   {
     return this._types.slice();
   }
      
  /**
   * Access the number of data items (not category labels) in a the table 
   * 
   * @return Int - Number of data items in any column of the Table
   */
   public get itemCount(): number
   {
     if( this._table.length == 0 )
       return 0;
        
     return this._table[0].length;
   }
      
  /**
   * Access a single column of data as a standalone array
   * 
   * @param category : String - category (column) name
   * 
   * @return Array - Copy of the current data in the specified column or an empty array if the category name is incorrect
   */
   public getColumn(category: string): Array<any>
   {
     var index: number = this._categories.indexOf(category);
     if( index == -1 )
       return new Array<any>();
          
     return this._table[index].slice();
   }

  /**
   * Remove a column from the current table
   *
   * @param category : String - category (column) name (often a dependent variable that will be forecast based on remaining table data)
   *
   * @return Nothing - If the named column exists in the table, it is removed and all other columns are shifted left
   */
   public removeColumn(category: string): void
   {
     var index: number = this._categories.indexOf(category);
     if( index == -1 )
       return;

     this._table.splice(index, 1);
   }

  /**
   * Access summary statistics for a column of numerical data
   * 
   * @param category : String - Category or column name
   * 
   * @return Array - Five number summary of the data column, min., 1st quartile, median, 3rd auartile, max.
   */
   public getSummary(category: string): Array<number>
   {
     var index: number = this._categories.indexOf(category);
     if( index == -1 )
       return new Array<number>();
          
     if( this._types[index] != TableTypeEnum.NUMERIC )
       return new Array<number>();
          
     this.__stats.data = this._table[index];
        
     return this.__stats.fiveNumbers;
   }
      
  /**
   * Access the range of a category or column of numerical data
   * 
   * @param category : String - Category or column name
   * 
   * @return Number - Difference between the max. and min. values of the column or zero if inputs are invalid
   */
   public getRange(category: string): number
   {
     var index: number = this._categories.indexOf(category);
     if( index == -1 )
       return 0;
          
     if( this._types[index] != TableTypeEnum.NUMERIC )
       return 0;
          
     this.__stats.data = this._table[index];
        
     var min:number  = this.__stats.min;
     var max: number = this.__stats.max;
        
     return max - min;
   }
      
  /**
   * Access the mean of a column of numerical data
   * 
   * @param category : String - Category or column name
   * 
   * @return Number - Arithmetic mean of the data or zero if inputs are invalid
   */
   public getMean(category: string): number
   {
     var index: number = this._categories.indexOf(category);
     if( index == -1 )
       return 0;
        
     this.__stats.data = this._table[index];
        
     return this.__stats.mean;
   }
      
  /**
   * Access the standard deviation of a column of numerical data
   * 
   * @param category : String - Category or column name
   * 
   * @return Number - Standard deviation of the data or zero if inputs are invalid
   */
   public getStd(category: string): number
   {
     var index: number = this._categories.indexOf(category);
     if( index == -1 )
       return 0;
         
     this.__stats.data = this._table[index];
         
     return this.__stats.std;
   }
      
  /**
   * Access quantiles of a category or column of numerical data
   * 
   * @param category : String - Category or column name
   * 
   * @param q : Number - Quantile fraction in (0,1), i.e. 0.25 for quartiles, 0.2 for quintiles, or 0.1 for deciles. 
   * 
   * @return Array - First and last elements are min and max elements of the data column.  Middle elements are the requested quantiles in order, i.e. 0.25, 0.5, 0.75 or
   * 0.2, 0.4, 0.6, 0.8 - currently computed by straight linear interpolation.  Will likely get more sophisticated in a future release.
   * 
   * Array will be empty for invalid data and quartile will default to 0.25 for invalid entries.
   */
   public getQuantiles(category: string, q: number): Array<number>
   {
     var index: number = this._categories.indexOf(category);
     if( index == -1 )
       return new Array<number>();
           
     if( this._types[index] != TableTypeEnum.NUMERIC )
       return new Array<number>();
           
     this.__stats.data = this._table[index];
         
     return this.__stats.getQuantile(q);
   }
      
  /**
   * Create a one-way table of categorical data for the specified column
   * 
   * @param category : String - Category or column name
   * 
   * @param asProportion : Boolean - True if the count is to be converted into a percentage (which is automatically rounded to two decimal places)
   * @default false
   * 
   * @return Object - name-value or key-value pairs.  Keys contain independent data items in the specified column of the original.  Values are the frequency count of each item.
   */
   public oneWayTable(category: string, _asPercentage: boolean=false): Object
   {
     var index: number = this._categories.indexOf(category);
     if( index == -1 )
       return new Object();
   
     var data: Array<any> = this._table[index];
     var n: number        = data.length;
        
     // store occurrences of the category here
     var count: Object = new Object();
     var i: number;
     var item: any;
        
     for( i=0; i<n; ++i )
     {
       item = data[i];
          
       if( count.hasOwnProperty(item) )
         count[item]++;
       else
         count[item] = 1;
     }
        
     if( _asPercentage )
     {
       var n1: number = 1.0/n;
       for( item in count )
         count[item] = (count[item]*n1*100).toFixed(2);
     }
        
     return count;
   }
      
  /**
   * Create a CrossTable between two columns of data
   * 
   * @param category1 : String - Name of first category that represents the independent variable in the contingency analysis
   * 
   * @param category 2 : String - Name of second category that represents the dependent variable(s)
   * 
   * @param grouping : Array - Optional array of space-delimited Strings used to group the second category for counting purposes (in which case the second column must contain 
   * character data).  If this argument is omitted or the array is blank, then the number of columns in the cross-table with be equal to the number of unique items in the
   * second category of data.  Otherwise, the number of columns in the CrossTable is the number of elements in the grouping array.  For example, a collection of colors such 
   * as 'Black,' 'Silver', 'Gray', 'White', 'Blue', 'Gold', 'Green', 'Yellow', 'Red' might be grouped as ["Black Silver White Gray", "Blue Gold Green Red Yellow"].  This results 
   * in a CrossTable with two columns, one for each group.
   * 
   * @param colNames : Array - Optional array of column names associated with each group.  It is only necessary to provide this information of grouping is applied.  Otherwise,
   * column names consist of each unique value in the dependent variable.
   * 
   * @return Object - 'chi2' property is total chi-squared value for the table, 'df' (table degrees of freedom), and 'q' property represents the q-value or probability that the table results 
   * occur by chance, based on chi-squared.  'table' property is an Object with keys consisting of an element of the CrossTable with the exception of the final 
   * column which contains the row counts and percentages of each row count of the total item count.  Row names are unique category names of the independent variable.  Output is 
   * ordered by ROWS.
   * 
   * Each cell object contains 'c' property, which is the fraction of the column total, 'r' property for fraction of the row total, 't' property for fraction of the table
   * total, and 'n' property for the cell count.  'chi2' property may be added in the future for cell chi-2 value.
   * 
   * The array will be empty if inputs are invalid.  It is acceptable to not supply the grouping argument as lack of presence of that array is interpreted as there is no 
   * grouping applied in the dependent variable.
   * 
   */
   public crossTable(category1: string, category2: string, grouping: Array<string>, colNames: Array<string>): Object
   {
     var index1: number = this._categories.indexOf(category1);
     var index2: number = this._categories.indexOf(category2);
        
     if( index1 == -1 || index2 == -1 )
       return new Object();
        
     var grouped: boolean = grouping != undefined && grouping != null;
     if( grouped )
       grouped = grouping.hasOwnProperty("length");
        
     var i: number;
     var j: number;
     var len: number;
        
     var columnNames: Array<string> = !colNames || !colNames.hasOwnProperty("length") ? new Array<string>() : colNames;
     if( columnNames.length != grouping.length )
     {
       // provide some default column name so at least the table data gets returned
       len = grouping.length;
       for( i=0; i<len; ++i )
         columnNames[i] = "G" + i.toString();
     }

     // final output table
     var counts: Object = new Object();
        
     // independent and dependent variables
     var x: Array<any> = this._table[index1];
     var n: number     = x.length;
     var y: Array<any> = this._table[index2];
        
     // build the output table
     var item: any;
     var col: string;
        
     // groups stored in arrays - if the data is not grouped, then create a grouped array from the unique elements in the dependent variable
     var groups: Array<Array<string>>;
     var columns: number;
        
     if( !grouped )
     {
       grouping = new Array<any>();          
       for( i=0; i<n; ++i )
       {
         item = y[i];
         if( grouping.indexOf(item) == -1 )
           grouping.push( item );
       }
     }
        
     // convert groups into a collection of arrays that can be quickly checked for presence of an item 
     columns = grouping.length;
     groups  = new Array<Array<string>>();
     
     for( i=0; i<columns; ++i )
       groups.push( grouping[i].split(" ") );
          
     // process each element in the independent variable
     for( i=0; i<n; ++i )
     {
       item = x[i];
       col  = y[i];
       var g: Array<string>;
            
       // which group?
       var indx: number = -1;
       for( j=0; j<columns; ++j )
       {
         g    = groups[j];
         indx = g.indexOf(col);
         if( indx != -1 )
         {
           indx = j;
           break;
         }
       }
            
       // update the count in the appropriate row
       var row: Array<number>;
       if( counts.hasOwnProperty(item) )
       {
         row = counts[item];
         if( isNaN(row[indx]) )
           row[indx] = 1;
         else
           row[indx]++;
       }
       else
       {
         row          = new Array<number>();
         row[indx]    = 1;
         counts[item] = row;
       }
     }
        
     // get the row and column counts - we have to keep the column counts in separate array - the row totals are appended onto each row count array
     var rowCount: number = 0;
     var colCount: number = 0;
        
     var columnCounts = new Array<number>();
     for( j=0; j<columns; ++j )
       columnCounts.push(0);
        
     var sum: number = 0.0;
        
     for( var key in counts )
     {
       rowCount = 0;
       if( counts.hasOwnProperty(key) )
       {
         row = counts[key];
            
         for( j=0; j<columns; ++j )
         {
           columnCounts[j] += row[j];
           rowCount        += row[j];
         }
            
         row.push(rowCount);
            
         sum += rowCount;
       }
     }
        
     // and, finally, we can compute chi-2 and the other goodies, then load them into the production table
     var expected: Object = new Object();
     var chi2: number     = 0.0;
     var e: number;
     var t: number;
     var s: number;
     var obj: Object;
     var theRow: Array<any>;
     var key: string;
   
     sum = 1.0/sum;
        
     for( key in counts )
     {
       if( counts.hasOwnProperty(key) )
       {
         theRow = counts[key];
         if( !expected.hasOwnProperty(key) )
           expected[key] = [];
        
         e        = expected[key];                 // row-vector of expected (and then observed - expected) values
         theRow   = counts[key];                   // current row counts 
         rowCount = theRow[columns];               // count was appended onto the array in previous step
            
         for( j=0; j<columns; ++j )
         {
           t    = (columnCounts[j]*rowCount)*sum;  // divide is probably a wash next to memory access times, but I'm kicking it old-school and invert-multiply
           s    = theRow[j] - t;                   // observed - expected
           e[j] = s*s/t;                           // (o-e)^2 / e
              
           chi2 += e[j];
              
           obj      = {};
           obj['n'] = theRow[j];    
           obj['r'] = theRow[j]/rowCount;
           obj['c'] = theRow[j]/columnCounts[j];
           obj['t'] = theRow[j]*sum;
      
           // I don't like this, but it's fast and uses less memory - will likely substitute something clearner in the future        
           theRow[j] = obj;
         }
       }
     }
        
     var df: number = (n-1)*(columns-1);
     //this.__chisq.set_nu( df );
        
     //return {chi2:chi2, df:df, q:__chisq.q(chi2), table:counts};
     return { chi2: chi2, df: df, q: 0.0, table: counts, colCounts:columnCounts };
   }
      
  /**
   * Create a full cross-tabulation between the first column of data and all other columns of data.  Note that the first column of data MUST be 
   * character (categorical) and remaining columns MUST contain numeric data (column labels are always character, so the first row is an exception).
   * 
   * @return Object - Same return object as the CrossTable method except that the output table is an ordered 2D array.  NOTE:  Output is ordered 
   * by columns, not rows.
   */
   public crossTabulation(): Object
   {
     if( this._table.length == 0 )
       return new Object();
          
     // final output table
     var counts:Array<any> = new Array<any>();
     var n: number         = this._table[0].length;
     var chi2: number      = 0.0;
        
     // build the output table
     var item: number;
     var col: Array<number>;
     var sum: number;
     var columns: number = this._categories.length - 1;
        
     // row and column counts 
     var colCount: number = 0;   
     var rowCounts: Array<number> = new Array<number>();

     for( j=0; j<n; ++j )
       rowCounts.push(0);
        
     var colCounts: Array<number> = new Array<number>();
     for( i=0; i<columns; ++i )
       colCounts.push(0);
                  
     // process each element in the independent variable against each other column in the table - since the table is column-major,
     // process the data by column
     sum = 0.0;
        
     for( j=0; j<columns; ++j )
     {
       col = this._table[j+1];
          
       colCount = 0;
       for( i=0; i<n; ++i )
       {
         colCount     += col[i];
         rowCounts[i] += col[i];
       }
          
       colCounts[j] = colCount;
          
       sum += colCount;
     }
        
     // finish off production table
     var e: number;
     var t: number;
     var i: number;
     var j: number;
     var obj: any;
     var rowCount: number;
     var s: number;

     sum = 1.0/sum;  // 1/total count
        
     for( j=0; j<columns; ++j )
     {
       col = this._table[j+1];
          
       counts[j] = new Array<any>();
       e         = counts[j];  // colum -vector of expected (and then observed - expected) values
          
       for( i=0; i<n; ++i )
       {
         rowCount = rowCounts[i];  // current row count

         // the usual suspects
         t    = (colCounts[j]*rowCount)*sum;     // divide is probably a wash next to memory access times, but I'm kicking it old-school and invert-multiply
         s    = col[i] - t;                      // observed - expected
         e[i] = s*s/t;                           // (o-e)^2 / e
              
         chi2 += e[i];
            
         obj      = {};
         obj['n'] = col[i];    
         obj['r'] = col[i]/rowCount;
         obj['c'] = col[i]/colCounts[j];
         obj['t'] = col[i]*sum;
            
         // fast, but not clean ... this loop will likely be refactored in the future
         e[i] = obj;
       }
     }
        
     // degrees of freedom
     var df: number = (n-1)*(columns-1);
     //this.__chisq.set_nu( df );
        
     //return {chi2:chi2, df:df, q:__chisq.q(chi2), table:counts};
     return { chi2: chi2, df: df, q: 0.0, table: counts };
   }

  /**
   * Normalize the current table and return the data in an Array
   *
   * @return Array - 2D Array of normalized data, i.e. each column is normalized to the range [0,1] with 0 equal to the minimum column element and 1 equal
   * to the column maximum.  The original table is unchanged
   */
   public normalize(): Array<Array<number>>
   {
     var output:Array<Array<any>> = this._table.slice();
     var n: number                = this._table.length;  // column count

     var i: number;
     var len: number;
     var minValue: number;
     var maxValue: number;

     // process the data by column
     var len: number = this._table.length;
     var j: number;
     var col: Array<number>;
     var r: number;

     for( j=0; j<n; ++j )
     {
       col = output[j];
       len = col.length;

       minValue = Number.MAX_VALUE;
       maxValue = Number.MIN_VALUE;

       for( i=0; i<len; ++i )
       {
         if( col[i] > minValue )
           minValue = col[i];

         if( col[i] > maxValue )
           maxValue = col[i];
       }
   
       // inverse of range
       r = 1.0/(maxValue - minValue);

       // normalize the column
       for( i=0; i<len; ++i )
         col[i] = r*(col[i] - minValue);
     }

     return output;
   }

  /**
   * Transform all column data in the table to z-scores return the data in an Array
   *
   * @return Array - 2D Array of z-scored data.  The original table is unchanged
   */
   public zScore(): Array<Array<any>>
   {
     var output:Array<Array<any>> = this._table.slice();
     var n: number                = this._table.length;  // column count

     var i: number;
     var len: number;
     var mu: number;
     var sigma: number;

     // process the data by column
     var j: number;
     var col: Array<number>;

     for( j=0; j<n; ++j )
     {
       col = output[j];
       len = col.length;

       // (mu, sigma) for column
       this.__stats.data = col;

       mu    = this.__stats.mean;
       sigma = 1.0/this.__stats.std;  // tbd - add numerical check 

       // z-scores for the column
       for( i=0; i<len; ++i )
         col[i] = (col[i]-mu)*sigma; 
     }

     return output;
   }

  /**
   * Break the current table (by row division) into a training set and a test, or validation set
   *
   * @param row : Int - Zero-based row index so that all rows from 0 to row are in the training set and rows row+1 to end of table are in the 
   * validation set.
   *
   * @param data : Array - Optional 2D data source to use in lieu of the current table; this is used in cases where normalized or externally 
   * transformed data is used in analysis
   *
   * @return Object - 'train' property contains a 2D array of the training data and 'test' contains the test or validation set as a 2D array
   */
   public split(row: number, data?: Array<Array<any>>): Object
   {
     var n: number;
     var m: number;

     if( !data )
     {
       n = this._table.length;
       m = n == 0 ? 0 : this._table[0].length;
     }
     else
     {
       n = data.length;
       m = n == 0 ? 0 : data[0].length;
     }

     if( row < 0 || row >= m )
       return { train:[], test:[] };

     var train: Array<Array<any>> = new Array<Array<any>>();
     var test: Array<Array<any>>  = new Array<Array<any>>();

     var j: number;
     for( j=0; j<n; ++j )
       train[j] = data ? data[j].slice(0,row+1) : this._table[j].slice(0,row+1);
        
     if( row < m )
     {
       for( j=0; j<n; ++j )
         test[j] = data ? data[j].slice(row+1,m) : this._table[j].slice(row+1, m);
     }

     return { train:train, test:test };
   }
      
   // utility method to convert table object with items and counts into an array of Objects with 'item' and 'count' properties.
   public __tblToArray(obj: Object): Array<Object>
   {
     var table: Array<Object> = new Array<Object>();
        
     for( var key in obj )
       table.push({ item: key, count: obj[key] } );
        
     return table;
   }
      
   // internal method - clear the current table and prepare for new input
   private __clear(): void
   {
     this._table.length      = 0;
     this._categories.length = 0;
     this._types.length      = 0;
   }
 }
