import analytics from '@react-native-firebase/analytics';
import { Bill } from '../models/Bill';
import { Comment, Vote } from '../models/BillData';

export module Analytics {
  const eventLogin = 'login';
  const eventPhoneNumberEntered = 'phone_entered';
  const eventSignUp = 'sign_up';
  const eventBillClick = 'bill_click';
  const eventBillFullPage = 'bill_full_page';
  const eventVote = 'vote';
  const eventCommentClick = 'comment_click';
  const eventCommentCopied = 'comment_copied';
  const eventCommentDeleted = 'comment_deleted';
  const eventCommentLikeChange = 'comment_like_change';
  const eventCommentCreateButtonClicked = 'comment_create_button_clicked';
  const eventCommentCreate = 'comment_create';
  const eventSearchSettingsClicked = 'search_settings_clicked';
  const eventSearchSettingsChanged = 'search_settings_changed';
  const eventSearchCategoryClicked = 'search_category_clicked';
  const eventSearchBillClick = 'search_bill_clicked';
  const eventSearchQuery = 'search_query';

  export async function setUID(uid: string) {
    return analytics().setUserId(uid);
  }

  export async function phoneNumberEntered(number: string) {
    return analytics().logEvent(eventPhoneNumberEntered, {
      number: number,
    });
  }

  export async function screenChange(screen: string) {
    return analytics().logScreenView({
      screen_name: screen,
      screen_class: screen,
    });
  }

  export async function login(uid: string, initial: boolean) {
    return analytics().logEvent(eventLogin, {
      uid: uid,
      initial: initial,
    });
  }

  export async function signUp(uid: string, method: string) {
    return analytics().logEvent(eventSignUp, {
      uid: uid,
      method: method,
    });
  }

  export async function billClick(bill: Bill) {
    return analytics().logEvent(eventBillClick, {
      chamber: bill.chamber,
      number: bill.number,
      assembly: bill.assembly,
      name: bill.title,
    });
  }

  export async function billFullPage(bill: Bill) {
    return analytics().logEvent(eventBillFullPage, {
      chamber: bill.chamber,
      number: bill.number,
      assembly: bill.assembly,
      name: bill.title,
    });
  }

  export async function voteEvent(bill: Bill, vote: number) {
    return analytics().logEvent(eventVote, {
      chamber: bill.chamber,
      number: bill.number,
      assembly: bill.assembly,
      name: bill.title,

      vote: vote,
    });
  }

  export async function commentClicked(bill: Bill, comment: Comment) {
    return analytics().logEvent(eventCommentClick, {
      chamber: bill.chamber,
      number: bill.number,
      assembly: bill.assembly,
      name: bill.title,
      commentUID: comment.uid,
    });
  }

  export async function commentCopied(bill: Bill, comment: Comment) {
    return analytics().logEvent(eventCommentCopied, {
      chamber: bill.chamber,
      number: bill.number,
      assembly: bill.assembly,
      name: bill.title,
      commentUID: comment.uid,
    });
  }
  export async function commentDeleted(bill: Bill, comment: Comment) {
    return analytics().logEvent(eventCommentDeleted, {
      chamber: bill.chamber,
      number: bill.number,
      assembly: bill.assembly,
      name: bill.title,
      commentUID: comment.uid,
    });
  }

  export async function commentLikeChange(
    bill: Bill,
    comment: Comment,
    like: boolean
  ) {
    return analytics().logEvent(eventCommentLikeChange, {
      chamber: bill.chamber,
      number: bill.number,
      assembly: bill.assembly,
      name: bill.title,
      commentUID: comment.uid,
      like: like,
    });
  }

  export async function createCommentButtonClicked(bill: Bill) {
    return analytics().logEvent(eventCommentCreateButtonClicked, {
      chamber: bill.chamber,
      number: bill.number,
      assembly: bill.assembly,
      name: bill.title,
    });
  }

  export async function createNewComment(bill: Bill, send: boolean) {
    return analytics().logEvent(eventCommentCreate, {
      chamber: bill.chamber,
      number: bill.number,
      assembly: bill.assembly,
      name: bill.title,
      sendToReps: send,
    });
  }

  export async function searchSettingsClicked() {
    return analytics().logEvent(eventSearchSettingsClicked);
  }

  export async function searchSettingsChanged(setting: string) {
    return analytics().logEvent(eventSearchSettingsChanged, {
      setting: setting,
    });
  }

  export async function searchCategoryClicked(category: string) {
    return analytics().logEvent(eventSearchCategoryClicked, {
      name: category,
    });
  }

  export async function searchBillClick(bill: Bill, query: string) {
    return analytics().logEvent(eventSearchBillClick, {
      chamber: bill.chamber,
      number: bill.number,
      assembly: bill.assembly,
      name: bill.title,
      query: query,
    });
  }

  export async function search(query: string, searchBy: string) {
    return analytics().logEvent(eventSearchQuery, {
      query: query,
      settings: searchBy,
    });
  }

  export async function launch() {
    return analytics().logAppOpen();
  }

  export async function feedback() {
    return analytics().logEvent('feedback');
  }
}
