import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-learning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learning.component.html',
  styleUrls: ['./learning.component.scss']
})
export class LearningComponent implements OnInit {

  questions: any[] = [];

  currentQuestion: any = null;

  currentIndex = 0;

  showAnswer = false;

  loading = true;

  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.reload();
  }


  reload(): void {
    
    this.loading = true;

    this.error = '';

    this.questions = [];

    this.currentQuestion = null;

    this.currentIndex = 0;

    this.showAnswer = false;

    this.http
      .get<any[]>('assets/data/learning/sample-questions.json')
      .pipe(take(1))
      .subscribe({

        next: (data) => {

          console.log('Questions Loaded', data);

          if (!Array.isArray(data)) {

            this.error = 'Invalid Question JSON';

            this.loading = false;

            return;

          }

          if (data.length === 0) {

            this.error = 'Question Bank is Empty';

            this.loading = false;

            return;

          }

          this.questions = [...data];

          this.currentIndex = 0;

          this.currentQuestion = this.questions[0];

          this.loading = false;

        },

        error: (err) => {

          console.error(err);

          this.error = 'Unable to load Question Bank';

          this.loading = false;

        }

      });

  }

  toggleAnswer(): void {

    this.showAnswer = !this.showAnswer;

  }

  previousQuestion(): void {

    if (this.currentIndex === 0) {

      return;

    }

    this.currentIndex--;

    this.currentQuestion = this.questions[this.currentIndex];

    this.showAnswer = false;

  }

  nextQuestion(): void {

    if (this.currentIndex >= this.questions.length - 1) {

      return;

    }

    this.currentIndex++;

    this.currentQuestion = this.questions[this.currentIndex];

    this.showAnswer = false;

  }

  goToQuestion(index: number): void {

    if (index < 0 || index >= this.questions.length) {

      return;

    }

    this.currentIndex = index;

    this.currentQuestion = this.questions[index];

    this.showAnswer = false;

  }

}