import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { TextInput } from 'react-native-gesture-handler';
import ProgressHUD from '../../../components/ProgressHUD';
import { fetchRepresentatives, Representative, User } from '../../../models';
import { Comment } from '../../../models/BillData';
import { addComment, fetchUser } from '../../../util';
import {
  BillDetailCommentScreenRouteProps,
  BillDetailsCommentScreenProps,
} from './BillDetailsStack';

interface Props {
  navigation: BillDetailsCommentScreenProps;
  route: BillDetailCommentScreenRouteProps;
}
interface State {
  reps: Representative[];
  shouldSendReps: boolean;
  text: string;
  showProgress: boolean;
}

export default class ComposeCommentScreen extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      reps: [],
      shouldSendReps: true,
      text: '',
      showProgress: false,
    };
  }

  componentDidMount() {
    fetchRepresentatives().then((reps) => {
      this.setState({ reps: reps });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ProgressHUD visible={this.state.showProgress} />

        <View style={styles.header}>
          <Text style={styles.headerText}>Share your opinion</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              this.props.navigation.goBack();
            }}
          >
            <Icon size={26} name="x" type="feather" color="black" />
          </TouchableOpacity>
        </View>
        <View
          style={{ flexDirection: 'row', flex: 1, paddingHorizontal: '7.5%' }}
        >
          <FastImage
            style={{ height: 60, borderRadius: 10, flex: 1 }}
            source={{
              uri:
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
            }}
          />
          <TextInput
            style={{ paddingLeft: '5%', fontSize: 18, flex: 5 }}
            multiline={true}
            placeholder="What's on your mind?"
            value={this.state.text}
            onChangeText={(text) => {
              this.setState({ text: text });
            }}
          />
        </View>
        <KeyboardAvoidingView behavior={'position'} style={styles.footer}>
          {this.state.shouldSendReps ? (
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
              }}
            >
              {this.state.reps.map((val) => (
                <FastImage
                  key={val.member_url}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 5,
                    marginHorizontal: 10,
                  }}
                  source={{ uri: val.picture_url }}
                />
              ))}
            </View>
          ) : undefined}
          {this.state.shouldSendReps ? (
            <Text
              style={{
                alignSelf: 'center',
                marginTop: '2.5%',
                fontSize: 16,
                fontFamily: 'Futura',
                fontWeight: '500',
              }}
            >
              Your Legislators
            </Text>
          ) : undefined}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              margin: '5%',
              justifyContent: 'space-evenly',
            }}
          >
            <Switch
              value={this.state.shouldSendReps}
              onValueChange={(val) => {
                this.setState({ shouldSendReps: val });
              }}
              trackColor={{ false: '', true: '#448aff' }}
            />
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Futura',
              }}
            >
              Send my thoughts to my legislators
            </Text>
          </View>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#448aff',
            }}
            onPress={async () => {
              // create comment and send
              let user = await fetchUser();
              let comment: Comment = {
                likes: {},
                text: this.state.text,
                uid: user.uid,
                name: user.name,
                date: Date.now(),
              };
              this.setState({ showProgress: true });
              addComment(this.props.route.params.bill, comment).then((val) => {
                this.setState({ showProgress: false });
                if (val) {
                  this.props.navigation.goBack();
                } else {
                  Alert.alert("Couldn't submit your request");
                }
              });
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 24,
                fontFamily: 'Futura',
                fontWeight: '600',
                paddingVertical: '5%',
              }}
            >
              {this.state.shouldSendReps ? 'Send to my Reps' : 'Send'}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '10%',
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: '5%',
    justifyContent: 'space-between',
    paddingHorizontal: '7.5%',
  },
  headerText: {
    fontFamily: 'Futura',
    fontSize: 24,
    fontWeight: '500',
  },
  closeButton: {},
  footer: {},
});
