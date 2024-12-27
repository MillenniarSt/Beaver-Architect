//             _____
//         ___/     \___        |  |
//      ##/  _.- _.-    \##  -  |  |                       -
//      ##\#=_  '    _=#/##  |  |  |  /---\  |      |      |   ===\  |  __
//      ##   \\#####//   ##  |  |  |  |___/  |===\  |===\  |   ___|  |==/
//      ##       |       ##  |  |  |  |      |   |  |   |  |  /   |  |
//      ##       |       ##  |  \= \= \====  |   |  |   |  |  \___/  |
//      ##\___   |   ___/
//      ##    \__|__/
//

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { openErrorDialog } from '../dialog/dialogs';

const backendUrl: string = 'http://localhost:8025'

type ResponseFunction = {
  data: any, 
  success: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(private http: HttpClient) { }

  get(url: string, query: Record<string, string | number | boolean> = {}): Promise<ResponseFunction> {
    let params = '?' + Object.keys(query).map(key =>
      `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
    ).join('&')
    
    return this.handleRequest(this.http.get(`${backendUrl}/${url}${params}`))
  }

  post(url: string, body: any): Promise<ResponseFunction> {
    return this.handleRequest(this.http.post(`${backendUrl}/${url}`, body))
  }

  put(url: string, id: string, changes: any): Promise<ResponseFunction> {
    return this.handleRequest(this.http.put(`${backendUrl}/${url}/${id}`, changes))
  }

  delete(url: string, query: Record<string, string | number | boolean> = {}): Promise<ResponseFunction> {
    let params = '?' + Object.keys(query).map(key =>
      `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
    ).join('&')

    return this.handleRequest(this.http.delete(`${backendUrl}/${url}${params}`))
  }

  private handleRequest(observable: Observable<Object>): Promise<ResponseFunction> {
    return new Promise((resolve) => {
      observable.pipe(catchError((err: HttpErrorResponse) => openErrorDialog(err, err.url ?? undefined))).subscribe((res: any) => {
        resolve({ data: res.data, success: res.success })
      })
    })
  }
}
