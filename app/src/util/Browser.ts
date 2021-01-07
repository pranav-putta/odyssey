import InAppBrowser from 'react-native-inappbrowser-reborn';

export module Browser {
  /**
   * open given url in the in app browser
   * @param url url string
   */
  export async function openURL(
    url: string,
    modal: boolean,
    readerMode: boolean
  ) {
    if (await InAppBrowser.isAvailable()) {
      await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: 'close',
        //preferredBarTintColor: '#453AA4',
        //preferredControlTintColor: 'white',
        readerMode: readerMode,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: modal,
        enableBarCollapsing: false,

        // Android Properties
        showTitle: true,
        toolbarColor: '#6200EE',
        secondaryToolbarColor: 'black',
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        // Specify full animation resource identifier(package:anim/name)
        // or only resource name(in case of animation bundled with app).
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
        headers: {
          'my-custom-header': 'my custom header value',
        },
      });
    }
  }
}
