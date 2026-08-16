import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

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

  currentIndex = 0;

  showAnswer = false;

  loading = true;

  error = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.loadQuestions();

  }

  loadQuestions(): void {

    this.loading = true;
    this.error = '';

    this.questions = [];
    this.currentIndex = 0;
    this.showAnswer = false;

    this.http
      .get<any[]>('assets/data/learning/sample-questions.json')
      .pipe(take(1))
      .subscribe({

        next: (data) => {

          console.log('Questions Loaded', data);

          /*
           * Validate JSON
           */
          if (!Array.isArray(data)) {

            this.questions = [];

            this.error =
              'Invalid question bank format. Expected an array of questions.';

            this.loading = false;

            this.cdr.detectChanges();

            return;
          }

          /*
           * Validate that questions actually exist
           */
          if (data.length === 0) {

            this.questions = [];

            this.error =
              'Question bank is empty.';

            this.loading = false;

            this.cdr.detectChanges();

            return;
          }

          /*
           * Store questions
           */
          this.questions = data;

          /*
           * Make sure index is valid
           */
          this.currentIndex = 0;

          this.showAnswer = false;

          this.loading = false;

          /*
           * IMPORTANT:
           * Force Angular to update the template immediately
           * after the HTTP response.
           */
          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'JSON Load Error:',
            err
          );

          this.questions = [];

          this.currentIndex = 0;

          this.showAnswer = false;

          this.error =
            'Unable to load the PMP question bank. Please refresh the page.';

          this.loading = false;

          /*
           * Force UI update after error
           */
          this.cdr.detectChanges();

        }

      });

  }

  /*
   * Current question
   */
  get currentQuestion(): any | null {

    if (
      !this.questions ||
      this.questions.length === 0
    ) {

      return null;

    }

    /*
     * Protect against invalid index
     */
    if (
      this.currentIndex < 0 ||
      this.currentIndex >= this.questions.length
    ) {

      this.currentIndex = 0;

    }

    return this.questions[this.currentIndex];

  }

  /*
   * Toggle answer
   */
  toggleAnswer(): void {

    this.showAnswer = !this.showAnswer;

  }

  /*
   * Next question
   */
  nextQuestion(): void {

    if (
      !this.questions.length
    ) {

      return;

    }

    if (
      this.currentIndex <
      this.questions.length - 1
    ) {

      this.currentIndex++;

      this.showAnswer = false;

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    }

  }

  /*
   * Previous question
   */
  previousQuestion(): void {

    if (
      !this.questions.length
    ) {

      return;

    }

    if (
      this.currentIndex > 0
    ) {

      this.currentIndex--;

      this.showAnswer = false;

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    }

  }

  /*
   * Jump directly to a question
   */
  goToQuestion(index: number): void {

    if (
      index < 0 ||
      index >= this.questions.length
    ) {

      return;

    }

    this.currentIndex = index;

    this.showAnswer = false;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }

  /*
   * Reload question bank
   */
  reload(): void {

    this.loadQuestions();

  }

}