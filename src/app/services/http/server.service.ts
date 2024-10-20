import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { openErrorDialog } from '../../dialog/dialogs';

const backendUrl: string = 'http://localhost:8025'

type ResponseFunction = (data: any) => void

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(private http: HttpClient) { }

  get(url: string, query: any, object?: Object, success?: ResponseFunction, unsuccess?: ResponseFunction) {
    let params = '?' + Object.keys(query).map(key =>
      `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
    ).join('&')
    
    url = `${backendUrl}/${url}${params}`
    this.handleRequest(url, this.http.get(url), object, success, unsuccess)
  }

  post(url: string, body: any, object?: Object, success?: ResponseFunction, unsuccess?: ResponseFunction) {
    url = `${backendUrl}/${url}`
    this.handleRequest(url, this.http.post(url, body), object, success, unsuccess)
  }

  put(url: string, id: string, changes: any, object?: Object, success?: ResponseFunction, unsuccess?: ResponseFunction) {
    url = `${backendUrl}/${url}/${id}`
    this.handleRequest(url, this.http.put(url, changes), object, success, unsuccess)
  }

  delete(url: string, id: string, object?: Object, success?: ResponseFunction, unsuccess?: ResponseFunction) {
    url = `${backendUrl}/${url}/${id}`
    this.handleRequest(url, this.http.delete(url), object, success, unsuccess)
  }

  private handleRequest(url: string, observable: Observable<Object>, object?: Object, success?: ResponseFunction, unsuccess?: ResponseFunction) {
    observable.pipe(catchError((err: HttpErrorResponse) => openErrorDialog(err, url))).subscribe((res: any) => {
      if(res.success === true) {
        success?.call(object, res.data)
      } else {
        unsuccess?.call(object, res.data)
      }
    })
  }
}
