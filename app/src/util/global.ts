import { Category } from '../models/Category';
import { fetchCategories } from './LocalStorage';
import categoriesJSON from './default/categories.json';
import smallCategoriesJSON from './default/smallcategories.json';
import { Topic } from '../models/Topic';

export class Global {
  private static kCategories: {
    [key: string]: Category;
  };
  static async setCategories() {
    Global.kCategories = await fetchCategories();
  }

  static getCategories(): { [key: string]: Category } {
    return Global.kCategories ? Global.kCategories : <any>categoriesJSON;
  }

  static getTopics(): { [key: string]: Topic } {
    return <any>smallCategoriesJSON;
  }

  static getTopicsAsArray(): Topic[] {
    return Object.values(this.getTopics());
  }

  static getCategoriesAsArray(): Category[] {
    return Object.values(this.getCategories());
  }
}

export default Global;
