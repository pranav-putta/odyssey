import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Icon } from 'react-native-elements';
import {
  BillDetailCommentFullScreenRouteProps,
  BillDetailsCommentFullScreenProps,
} from './BillDetailsStack';
import { Image } from 'react-native-animatable';
import { User } from '../../../redux/models/user';
export default function BillCommentFullScreeen(props: {
  navigation: BillDetailsCommentFullScreenProps;
  route: BillDetailCommentFullScreenRouteProps;
}) {
  const { comment, formattedDate, voteColor, voteText } = props.route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          props.navigation.pop();
        }}
      >
        <Icon size={26} name="arrow-left" type="feather" color="black" />
      </TouchableOpacity>

      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <Image
          style={styles.profile}
          source={{
            uri: `https://odyssey-user-pfp.s3.us-east-2.amazonaws.com/${comment.uid}_pfp.jpg`,
          }}
        />
        <View
          style={{
            padding: '1%',
            paddingHorizontal: '5%',
            marginTop: '5%',
            flex: 1,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: 'Futura',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {comment.name}
              </Text>
              <View
                style={{
                  backgroundColor: voteColor,
                  paddingVertical: 3,
                  paddingHorizontal: 8,
                  borderRadius: 5,
                  marginLeft: 7.5,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Futura',
                    color: 'white',
                    fontWeight: '500',
                  }}
                >
                  {voteText}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontFamily: 'Futura',
                fontSize: 12,
                color: '#9e9e9e',
              }}
            >
              {formattedDate}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'Futura',
              fontSize: 15,
              lineHeight: 20,
              marginTop: '2.5%',
            }}
          >
            {comment.text}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: '10%',
    marginHorizontal: '7.5%',
  },
  closeButton: {
    width: 40,
    height: 40,
    zIndex: 100,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '5%',
    marginHorizontal: '7.5%',
  },
  headerText: {
    marginLeft: '5%',
    fontFamily: 'Futura',
    fontWeight: '600',
    fontSize: 26,
  },
  buttonGroup: {
    width: '85%',
    height: '10%',
    marginHorizontal: '7.5%',

    flexDirection: 'row',
    marginTop: '5%',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 1 },
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 25,
  },
  topComment: {
    width: '96%',
    borderRadius: 10,
    paddingVertical: '5%',
    paddingHorizontal: '7.5%',
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 1 },
    backgroundColor: 'white',
    marginHorizontal: '2%',
  },
  commentBox: {
    width: '100%',
    borderRadius: 10,

    paddingVertical: '2.5%',
    paddingHorizontal: '7.5%',
    backgroundColor: 'white',
    marginTop: '5%',
  },
  quoteIcon: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0091ea',
    borderRadius: 5,
    shadowColor: 'black',
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 1 },
  },
  profile: { width: 45, height: 45, marginTop: '5%', borderRadius: 40 },
  profileName: {
    justifyContent: 'flex-end',
    padding: '1%',
    paddingHorizontal: '5%',
    flex: 1,
  },
  bigQuoteFloatingIcon: {
    position: 'absolute',
    bottom: '10%',
    right: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
