import { logger } from '../../shared';

export class Progress {
  private processed: number = 0;
  private total: number;
  private startDate: Date;
  private errors: {}[];

  constructor(totalArticles: number) {
    logger.info('Sync started');
    this.total = totalArticles;
    this.startDate = new Date();
    this.errors = [];
  }

  public step(length: number = 1) {
    this.processed += length;
  }

  public logError(error) {
    if (error.message) {
      this.errors.push(error.message);
    } else if (error.response) {
      const { status, statusText, data } = error.response;
      logger.info(status, statusText);
      this.errors.push(data);
    }
  }

  public finish() {
    logger.info('Sync finished');
    logger.info(this.data);
  }

  public get data () {
    const timeRunning = this.formatTimeRunning;
    const percentage = Math.floor(this.processed * 100 / this.total);
    const etc = this.minutesETC;
    return {
      timeRunning,
      etc: `${etc} minutes`,
      progress: `${percentage}% - ${this.processed}/${this.total} [${this.errors.length}] | ${timeRunning}/~${etc}min`,
      articlesProcessed: this.processed,
      errorsCount: this.errors.length,
      errors: this.errors,
    };
  }

  private get minutesETC() {
    const msRunning = new Date().getTime() - this.startDate.getTime();
    const ms = Math.ceil(this.total * msRunning / this.processed);
    return Math.ceil(ms / 1000 / 60);
  }

  private get formatTimeRunning() {
    const ms = new Date().getTime() - this.startDate.getTime();
    return Number(ms / 1000 / 60).toFixed(2);
  }

}
