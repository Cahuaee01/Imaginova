import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { VoteResponse } from '../_items/VoteResponse';
import { CreationPageResponse } from '../_items/CreationResponse';
import { config } from '../config/config';
import { UserCreationItem } from '../_items/UserCreationtem';

@Injectable({
  providedIn: 'root'
})

export class  CreationService {
  url = config.apiUrl;
  constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  uploadCreation(formData: FormData, challenge_id: number) {
    const url = `${this.url}/challenge/${challenge_id}/creation`;
    return this.http.post(url, formData); 
  }

  getCreations(limit: number, page: number, sortBy: string, order: string) {
    let params = new HttpParams()
        .set('limit', limit.toString())
        .set('page', page.toString())
        .set('sortBy', sortBy)
        .set('order', order);

    return this.http.get(`${this.url}/creation`, { params });
  }

  getUserCreations(limit: number, page: number, sortBy: string, order: string, media: string, other_user_id: number) {
    let params = new HttpParams()
        .set('limit', limit.toString())
        .set('page', page.toString())
        .set('sortBy', sortBy)
        .set('order', order)
        .set('media', media);

    return this.http.get<UserCreationItem>(`${this.url}/user/${other_user_id}/creation`, { params });
  }

  getChallengeCreations(limit: number, page: number, sortBy: string, order: string, challenge_id: number, media: string) {
    let params = new HttpParams()
        .set('limit', limit.toString())
        .set('page', page.toString())
        .set('sortBy', sortBy)
        .set('order', order)
        .set('media', media);

    return this.http.get<CreationPageResponse>(`${this.url}/challenge/${challenge_id}/creation`, { params });
  }

  setVote(challenge_id: number, creation_id: number, vote_type: string){
    const url = `${this.url}/challenge/${challenge_id}/creation/${creation_id}/vote`;
    return this.http.post<VoteResponse>(url, { vote_type } );
  }

  refreshVote(challenge_id: number, creation_id: number){
    const url = `${this.url}/challenge/${challenge_id}/creation/${creation_id}/vote`;
    return this.http.get<VoteResponse>(url);
  }
}