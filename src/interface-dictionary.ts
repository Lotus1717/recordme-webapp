namespace DuckTypes {
  // 元接口
  interface recordMark {markText: string, record: string}
  interface record {recordId: number, recordName: string, recordUrl: string}
  export interface recordId {recordId: number} 
  
  interface tag {tagId: number, tagName: string}
  interface mark {markId: number, markText: string}
  interface returnVal {result: boolean, msg: string}
  export interface userVal {userId: number}

  // 复合接口
  interface recordMarkDetail extends record, mark {}
  interface userTag extends tag, userVal {}
  interface page extends record {markList: Array<mark>, tagList: Array<tag>}

  // 入参接口
  export interface IRecordVal {userId: number, data: {url: string, title: string, recordList: Array<recordMark>}}
  export interface QRecordVal {userId: number, recordName: string}
  export interface IMarksVal {recordId: number, markList: Array<recordMark>}
  export interface ITagsVal {userId: number, tags: Array<string>}
  export interface IRTagsVal {recordId: number, tagIds: Array<string>}
  export interface DMarkVal {markId: number}
  export interface DRecordVal {recordId: number, userId: number}
  export interface QTagsVal {userId: number, tags: Array<string>}
  export interface QRTagsVal {recordIds: Array<number>}
  export interface QUserVal {name: string, password: string}
  export interface latchVal extends returnVal {data?: any}
  export interface URecordVal {userId: number, data: {url: string, title: string, tags: Array<string>, recordList: Array<recordMark>}}
  export interface DOneRecordVal {userId: number, data: recordId}
  export interface DRecordMarkVal {userId: number, data: {markId: number, recordId: number}}
  export interface URecordTagsVal {userId: number, data: {tags: Array<string>, recordId: number}}


  // 出参接口
  export interface QReturnVal {result: boolean, error?: object, data?: any}
  export interface QRecordReturnVal extends returnVal {data?: record}
  export interface IRecordReturnVal extends returnVal { data?: recordId}
  export interface ITagsReturnVal extends returnVal { data?: Array<string>}
  export interface QTagsReturnVal extends returnVal { data?: Array<userTag>}
  export interface QRTagsReturnVal extends returnVal { data?: Array<Array<tag>>}
  export interface QRecordsReturnVal extends returnVal { data?: Array<record>}
  export interface QMarksReturnVal extends returnVal { data?: Array<Array<mark>>}
  export interface QUserReturnVal extends returnVal { data?: userVal}
  export interface QUserRecordsReturnVal extends returnVal { data?: Array<recordMarkDetail>}
  export interface QPagesReturnVal extends returnVal {data?: Array<page>}
  export interface URecordTagReturnVal extends returnVal {data?: Array<tag>}
}
