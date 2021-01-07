import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import HTML from 'react-native-render-html';
import Space from '../../../components/Space';
import { Browser } from '../../../util/Browser';
interface Props {}
interface State {}

const height = Dimensions.get('screen').height;

const htmlContent = `
  <img style="width:100%;height:${
    height * 0.9 * 0.75 * 0.5
  }" src="https://qph.fs.quoracdn.net/main-qimg-0fbd891633b05dbfc74e2fe82fc0d21e.webp"/>
  <div style="margin:7.5%">
    <h1>Baby Yoda</h1>
    <p>This man is so lit you literally just have to check him out. I swear to god if you don't I'm going to bite your cock off HEHEHEH</p>
    <a style="" href="http://www.google.com">Ok</a>  
  </div>
  `;
class LikedScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    let width = Dimensions.get('screen').width * 0.75;
    return (
      <>
        <View style={styles.container}>
          <View style={styles.web}>
            <ScrollView overScrollMode="never" bounces={false}>
              <HTML
                onLinkPress={(_, href) => {
                  Browser.openURL(href, false, false);
                }}
                containerStyle={{ flex: 1 }}
                source={{ html: htmlContent }}
                contentWidth={width}
              />
            </ScrollView>
          </View>
        </View>
        <Space height="10%" />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  web: {
    width: '75%',
    height: '55%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
});
export default LikedScreen;
