import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChallengeResponse, ChallengesResponse } from '../_items/ChallengeResponse';
import { CreationResponse } from '../_items/CreationResponse';
import { config } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  url = config.apiUrl;
  constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  getCurrentChallenge() {
    const url = `${this.url}/challenge/current`; 
    return this.http.get<ChallengeResponse>(url, this.httpOptions); 
  }

  checkParticipation(user_id: number, challenge_id: number) {
    const url = `${this.url}/challenge/${challenge_id}/creation/${user_id}`; 
    return this.http.get<CreationResponse>(url);
  } 

  getChallenges(limit: number, page: number, sortBy: string, order: string, startDate?: string, endDate?: string) {
    let params = new HttpParams()
        .set('limit', limit.toString())
        .set('page', page.toString())
        .set('sortBy', sortBy)
        .set('order', order);

    if (startDate) {
        params = params.set('startDate', startDate);
    }

    if (endDate) {
        params = params.set('endDate', endDate);
    }

    return this.http.get<ChallengesResponse>(`${this.url}/challenge`, { params });
  }

  getChallenge(challenge_id: number){
    const url = `${this.url}/challenge/${challenge_id}`; 
    return this.http.get<ChallengeResponse>(url, this.httpOptions); 
  }
  
}
