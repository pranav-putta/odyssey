import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../assets';
import { Icon } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import { Config } from '../../../util/Config';
import CategoryCard from './CategoryCard';
import SearchSettingModal from './SearchSettingsModal';
import SearchBillCard from './SearchBillCard';
import { Bill, BillHandler, formatBillNumber } from '../../../models/Bill';
import { BillSearchScreenProps } from './SearchTab';
import ProgressHUD from '../../../components/ProgressHUD';
import { Analytics } from '../../../util/services/AnalyticsHandler';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import { Topic } from '../../../models/Topic';
import Space from '../../../components/Space';
import store from '../../../redux/store';
import CommitteeCard from './CommitteeCard';
import { Committee } from '../../../redux/models/committee';
import { createStackNavigator } from '@react-navigation/stack';
import { Network } from '../../../util';
import { UIService } from '../../../redux/ui/ui';
import { UIStatusCode } from '../../../redux/ui/ui.types';
import { ErrorScreen } from '../../ErrorScreen';
import { connect } from 'react-redux';

type State = {
  searchStarted: boolean;
  searchSettingsVisible: boolean;
  searchBills: Bill[];
  searchBy: string;
  searchQuery: string;
  progress: boolean;
};

type Props = {
  navigation: BillSearchScreenProps;
  error?: string;
  loading: boolean;
};

let SearchStack = createStackNavigator();

function mapStoreToProps() {
  let { ui } = store.getState();
  return {
    error: ui.status.code == UIStatusCode.error ? ui.status.message : undefined,
    loading: ui.status.code == UIStatusCode.loading,
  };
}

class SearchBarScreen extends React.Component<Props, State> {
  private popularCategoriesAnimation: Animated.Value;
  private typingTimeout: ReturnType<typeof setTimeout>;

  constructor(props: Props) {
    super(props);
    this.state = {
      searchStarted: false,
      searchSettingsVisible: false,
      searchBills: [],
      searchBy: 'title',
      searchQuery: '',
      progress: false,
    };

    this.popularCategoriesAnimation = new Animated.Value(1);
    this.typingTimeout = setTimeout(() => {}, 0);

    this.startSearch = this.startSearch.bind(this);
  }

  toggleSearch = (val: boolean) => {
    Animated.timing(this.popularCategoriesAnimation, {
      toValue: val ? 0 : 1,
      useNativeDriver: true,
      duration: 150,
    }).start(() => {
      this.setState({
        searchStarted: val,
        searchBills: [],
      });
    });
  };

  startSearch(by: string, query: string, extra?: string) {
    this.setState(
      { searchStarted: true, searchBy: by, searchQuery: extra ?? query },
      () => {
        // do search
        store.dispatch(
          UIService.setState({ status: { code: UIStatusCode.loading } })
        );
        Network.search(by, query)
          .then((bills) => {
            store.dispatch(
              UIService.setState({
                status: { code: UIStatusCode.stable },
              })
            );
            this.setState({ searchBills: bills });
          })
          .catch((err) => {
            store.dispatch(UIService.setError("Couldn't fetch bills:\n" + err));
          });
      }
    );
  }

  mapScreen() {
    let screen = (
      <SearchStack.Screen name={'Content'}>
        {() => <Content search={this.startSearch} />}
      </SearchStack.Screen>
    );

    if (this.props.error) {
      screen = (
        <SearchStack.Screen name={'SearchContent'}>
          {() => <ErrorScreen message={this.props.error} />}
        </SearchStack.Screen>
      );
    } else {
      if (this.state.searchStarted) {
        screen = (
          <SearchStack.Screen name={'SearchContent'}>
            {() => (
              <SearchContent
                visible={this.state.searchStarted}
                setSearching={(val: boolean) => {
                  this.setState({ searchStarted: val });
                }}
                bills={this.state.searchBills}
                loading={this.props.loading}
              />
            )}
          </SearchStack.Screen>
        );
      }
    }

    return screen;
  }

  render() {
    return (
      <SafeAreaView style={styles.card} edges={['top']}>
        <ProgressHUD visible={this.state.progress} />
        <SearchSettingModal
          visible={this.state.searchSettingsVisible}
          setSearchType={(val) => {
            Analytics.searchSettingsChanged(val);
            this.setState({ searchBy: val });
          }}
          dismiss={() => {
            this.setState({ searchSettingsVisible: false });
          }}
        />
        {this.state.searchBy === 'title' ? (
          <SearchBar
            setSearching={(val: boolean) => {
              this.setState({ searchStarted: val });
            }}
            isSearching={this.state.searchStarted}
            startSearch={(query) => {
              this.startSearch('title', query);
            }}
            clear={() => {
              this.setState({ searchBills: [] });
            }}
          />
        ) : (
          <View style={[styles.searchBar, { justifyContent: 'space-between' }]}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              style={{ fontSize: 16, fontFamily: 'Futura', maxWidth: '80%' }}
            >
              Searching for: "{this.state.searchQuery.trim()}"
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  searchStarted: false,
                  searchBy: 'title',
                  searchQuery: '',
                });
              }}
            >
              <Text style={{ color: colors.democrat, fontFamily: 'Futura' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <SearchStack.Navigator
          keyboardHandlingEnabled={false}
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        >
          {this.mapScreen()}
        </SearchStack.Navigator>
      </SafeAreaView>
    );
  }
}

function SearchContent(props: {
  visible: boolean;
  setSearching: (searching: boolean) => void;
  loading: boolean;
  bills: Bill[];
}) {
  if (!props.visible) {
    return null;
  }

  let { bills, loading } = props;
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        position: 'absolute',
      }}
      onTouchEnd={() => {
        if (bills.length == 0 && !loading) {
          props.setSearching(false);
          Keyboard.dismiss();
        }
      }}
    >
      {props.loading ? (
        <ActivityIndicator size={'large'} />
      ) : props.bills.length > 0 ? (
        <FlatList
          keyboardDismissMode={'on-drag'}
          keyboardShouldPersistTaps={'never'}
          keyExtractor={(item) => item.actions_hash}
          data={props.bills}
          ListFooterComponent={
            <Space height={Dimensions.get('screen').height * 0.11} />
          }
          renderItem={({ item }) => {
            return (
              <SearchBillCard
                bill={item}
                onPress={() => {
                  store.dispatch(UIService.launchBill(BillHandler.meta(item)));
                }}
              />
            );
          }}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 24, fontFamily: 'Futura' }}>
            No Bills Found!
          </Text>
        </View>
      )}
    </View>
  );
}

function SearchBar(props: {
  setSearching: (searching: boolean) => void;
  isSearching: boolean;
  startSearch: (query: string) => void;
  clear: () => void;
}) {
  let [query, setQuery] = useState('');
  let [searchTimer, setSearchTimer] = useState(setTimeout(() => {}, 0));

  const startSearchTimer = () => {
    clearTimeout(searchTimer);
    setSearchTimer(
      setTimeout(() => {
        props.startSearch(query);
      }, 500)
    );
  };

  return (
    <View style={styles.searchBar}>
      <Icon name="search" type="feather" size={18} />
      <TextInput
        placeholderTextColor={colors.searchBarPlaceholder}
        placeholder="Search for bills"
        style={styles.searchBarTextInput}
        value={query}
        returnKeyType="search"
        onChangeText={(query) => {
          setQuery(query);

          if (query.length < 2) {
            props.clear();
            return;
          }
          startSearchTimer();
        }}
        onTouchEnd={() => props.setSearching(true)}
        clearButtonMode="always"
      />
      {!props.isSearching ? (
        <TouchableOpacity
          style={styles.searchBarSliderButton}
          onPress={() => {
            Analytics.searchSettingsClicked();
          }}
        >
          <Icon
            type="feather"
            name="sliders"
            size={18}
            color={colors.searchBarSliderIcon}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{ paddingRight: 10 }}
          onPress={() => {
            setQuery('');
            props.setSearching(false);
            Keyboard.dismiss();
          }}
        >
          <Text style={{ color: colors.democrat }}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Content(props: {
  search: (by: string, query: string, extra?: string) => void;
}) {
  let topicsRaw = Config.getSmallTopics();
  let names = Object.keys(topicsRaw);
  let topics: [string, Topic][] = [];

  names.forEach((key) => {
    topics.push([key, topicsRaw[key]]);
  });

  return (
    <View style={{ backgroundColor: 'white' }}>
      <FlatList
        contentContainerStyle={{ paddingLeft: '5%' }}
        keyExtractor={(item) => item[0]}
        data={topics
          .sort((a, b) => (a[0] > b[0] ? 1 : b[0] > a[0] ? -1 : 0))
          .filter((val) => val[1].display)}
        renderItem={({ item, index }) => {
          const committees = store.getState().storage.committees[item[0]];

          return (
            <CategoryList
              topic={item[1]}
              committees={committees}
              search={props.search}
            />
          );
        }}
        ListFooterComponent={
          <Space height={Dimensions.get('screen').height * 0.11} />
        }
        showsHorizontalScrollIndicator={false}
        snapToInterval={120}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
      />
    </View>
  );
}

function CategoryList(props: {
  topic: Topic;
  committees: Committee[];
  search: (searchBy: string, query: string, extra?: string) => void;
}) {
  const { topic } = props;
  return (
    <View style={{ marginBottom: 15 }}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center' }}
        onPress={() => {
          props.search('category', topic.name);
        }}
      >
        <View
          style={{
            backgroundColor: topic.color,
            padding: '0.5%',
            borderRadius: 5,
          }}
        >
          <FastImage
            source={{ uri: topic.image }}
            style={{ width: 25, height: 25 }}
          />
        </View>
        <Space width={10} />
        <Text style={{ fontFamily: 'Futura', fontSize: 16 }}>{topic.name}</Text>
      </TouchableOpacity>
      {props.committees && (
        <>
          <Space height={10} />
          <FlatList
            horizontal
            keyExtractor={(item) => item.id.toString()}
            data={props.committees}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <CommitteeCard
                committee={item}
                onPress={() => {
                  props.search('committee', item.id.toString(), item.name);
                }}
              />
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: '1.5%',
  },
  container: {
    marginTop: '5%',
    marginHorizontal: '5%',
    flex: 1,
  },
  header: {
    fontSize: 30,
    fontFamily: 'Futura',
    fontWeight: '600',
    textAlign: 'left',
  },
  subheader: {
    fontSize: 20,
    fontFamily: 'Futura',
    fontWeight: '500',
    textAlign: 'left',
    marginHorizontal: '5%',
  },
  searchBar: {
    backgroundColor: colors.searchBarBackground,
    paddingLeft: '5%',
    paddingRight: '2.5%',
    marginHorizontal: '5%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    marginBottom: '5%',
  },
  searchBarIcon: {
    flex: 1,
    height: '50%',
  },
  searchBarTextInput: {
    flex: 11,
    marginLeft: 10,
    fontSize: 18,
    color: 'black',
  },
  searchBarSliderButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1.5 },
  },
  categoryList: {
    marginTop: '2.5%',
  },
  searchList: {},
});

export default connect(mapStoreToProps)(SearchBarScreen);
