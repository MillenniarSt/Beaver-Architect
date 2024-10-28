import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { openErrorDialog } from '../../dialog/dialogs';
import { ElectronService } from 'ngx-electron';

type Plugin = {
  identifier: string,
  port: number,

  name: string,
  icon: string
}

type ResponseFunction = (data: any) => void

@Injectable({
  providedIn: 'root'
})
export class PluginsService {

  private plugins: Plugin[] = []

  private architect?: Plugin

  constructor(private http: HttpClient) { }

  ensurePlugins(electron: ElectronService): Promise<void> {
    return new Promise((resolve) => {
      if (this.plugins.length === 0) {
        electron.ipcRenderer.once('plugin:send-all', (e, data) => {
          this.plugins = data
          resolve()
        })
        electron.ipcRenderer.invoke('plugin:init-all')
      } else {
        resolve()
      }
    })
  }

  setArchitect(identifier: string) {
    this.architect = this.plugins.find((plugin) => plugin.identifier === identifier)
  }

  get(direction: PluginDirection, url: string, query: any, object?: Object, success?: ResponseFunction, unsuccess?: ResponseFunction) {
    let params = '?' + Object.keys(query).map(key =>
      `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
    ).join('&')

    this.getPorts(direction).forEach((port) => {
      url = `http://localhost:${port}/${url}${params}`
      this.handleRequest(url, this.http.get(url), object, success, unsuccess)
    })
  }

  post(direction: PluginDirection, url: string, body: any, object?: Object, success?: ResponseFunction, unsuccess?: ResponseFunction) {
    this.getPorts(direction).forEach((port) => {
      url = `http://localhost:${port}/${url}`
      this.handleRequest(url, this.http.post(url, body), object, success, unsuccess)
    })
  }

  put(direction: PluginDirection, url: string, id: string, changes: any, object?: Object, success?: ResponseFunction, unsuccess?: ResponseFunction) {
    this.getPorts(direction).forEach((port) => {
      url = `http://localhost:${port}/${url}/${id}`
      this.handleRequest(url, this.http.put(url, changes), object, success, unsuccess)
    })
  }

  delete(direction: PluginDirection, url: string, id: string, object?: Object, success?: ResponseFunction, unsuccess?: ResponseFunction) {
    this.getPorts(direction).forEach((port) => {
      url = `http://localhost:${port}/${url}/${id}`
      this.handleRequest(url, this.http.delete(url), object, success, unsuccess)
    })
  }

  private handleRequest(url: string, observable: Observable<Object>, object?: Object, success?: ResponseFunction, unsuccess?: ResponseFunction) {
    observable.pipe(catchError((err: HttpErrorResponse) => openErrorDialog(err, url))).subscribe((res: any) => {
      if (res.success === true) {
        success?.call(object, res.data)
      } else {
        unsuccess?.call(object, res.data)
      }
    })
  }

  private getPorts(direction: PluginDirection): number[] {
    switch (direction) {
      case PluginDirection.ARCHITECT: return [this.architect!.port]
      case PluginDirection.ALL_PLUGINS: return this.plugins.map((plugin) => plugin.port)
      case PluginDirection.EVERY_PLUGINS: return this.plugins.map((plugin) => plugin.port)
      default: return []
    }
  }
}

export enum PluginDirection {

  ARCHITECT,
  ALL_PLUGINS,
  EVERY_PLUGINS
}