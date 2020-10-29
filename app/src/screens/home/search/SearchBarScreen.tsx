import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../assets';
import { Icon } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import { Config } from '../../../util/Config';
import CategoryCard from './CategoryCard';
import SearchSettingModal from './SearchSettingsModal';
import { search } from '../../../util';
import SearchBillCard from './SearchBillCard';
import { Bill, formatBillNumber } from '../../../models/Bill';
import { BillSearchScreenProps } from './SearchTab';
import ProgressHUD from '../../../components/ProgressHUD';
import { Analytics } from '../../../util/AnalyticsHandler';

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
};

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
  }

  toggleSearch = () => {
    Animated.timing(this.popularCategoriesAnimation, {
      toValue: this.state.searchStarted ? 1 : 0,
      useNativeDriver: true,
      duration: 150,
    }).start(() => {
      this.setState({
        searchStarted: !this.state.searchStarted,
        searchBills: [],
      });
    });
  };

  render() {
    return (
      <SafeAreaView style={styles.card}>
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
        <View style={styles.container}>
          <Text style={styles.header}>Explore</Text>
          <TouchableOpacity style={styles.searchBar} activeOpacity={1}>
            <Icon name="search" type="feather" size={18} />
            <TextInput
              placeholderTextColor={colors.searchBarPlaceholder}
              placeholder="Search for bills"
              style={styles.searchBarTextInput}
              value={this.state.searchQuery}
              onFocus={() => {
                this.toggleSearch();
              }}
              onBlur={() => {
                this.toggleSearch();
              }}
              returnKeyType="search"
              onChangeText={(query) => {
                this.setState({ searchQuery: query });
                if (query !== '') {
                  if (this.typingTimeout) {
                    clearTimeout(this.typingTimeout);
                  }
                  this.typingTimeout = setTimeout(() => {
                    let searchBy = this.state.searchBy;
                    Analytics.search(query, searchBy);
                    console.log('searching');
                    if (query.length != 0) {
                      search(searchBy, query).then((bills) => {
                        this.setState({ searchBills: bills });
                      });
                    } else {
                      this.setState({ searchBills: [] });
                    }
                  }, 300);
                } else {
                  this.setState({ searchBills: [] });
                }
              }}
              clearButtonMode="always"
            />
            <TouchableOpacity
              style={styles.searchBarSliderButton}
              onPress={() => {
                Analytics.searchSettingsClicked();
                this.setState({ searchSettingsVisible: true });
              }}
            >
              <Icon
                type="feather"
                name="sliders"
                size={18}
                color={colors.searchBarSliderIcon}
              />
            </TouchableOpacity>
          </TouchableOpacity>
          {this.state.searchBills.length == 0 ? (
            <Animated.View style={{ opacity: this.popularCategoriesAnimation }}>
              <Text style={styles.subheader}>Popular Categories</Text>
              <FlatList
                contentContainerStyle={{ paddingLeft: '0%' }}
                style={styles.categoryList}
                keyExtractor={(item) => item.name}
                data={Config.getSmallTopicsAsArray().filter(
                  (val) => val.display
                )}
                renderItem={(data) => {
                  return (
                    <CategoryCard
                      onPress={() => {
                        Analytics.searchCategoryClicked(data.item.name);
                        this.setState({ searchQuery: data.item.name });
                        this.setState({ progress: true });
                        search(this.state.searchBy, data.item.name).then(
                          (bills) => {
                            this.setState({
                              searchBills: bills,
                              progress: false,
                            });
                          }
                        );
                      }}
                      category={data.item}
                    />
                  );
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={120}
                snapToAlignment="start"
              />
            </Animated.View>
          ) : undefined}
          {this.state.searchBills.length != 0 ? (
            <Animated.View>
              <FlatList
                style={styles.searchList}
                data={this.state.searchBills}
                keyExtractor={(item) => formatBillNumber(item)}
                keyboardDismissMode="on-drag"
                renderItem={(data) => {
                  return (
                    <SearchBillCard
                      onPress={() => {
                        const categories = Config.getTopics();
                        this.props.navigation.navigate('Details', {
                          bill: data.item,
                          category: categories[data.item.category],
                        });
                      }}
                      bill={data.item}
                    />
                  );
                }}
              />
            </Animated.View>
          ) : undefined}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    marginTop: '5%',
  },
  header: {
    fontSize: 30,
    fontFamily: 'Futura',
    fontWeight: '600',
    textAlign: 'left',
    marginHorizontal: '10%',
    marginBottom: '5%',
  },
  subheader: {
    fontSize: 25,
    fontFamily: 'Futura',
    fontWeight: '400',
    textAlign: 'left',
    marginHorizontal: '10%',
  },
  searchBar: {
    backgroundColor: colors.searchBarBackground,
    paddingLeft: '5%',
    paddingRight: '2.5%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginHorizontal: '10%',
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
    marginLeft: '10%',
  },
  searchList: {},
});

export default SearchBarScreen;
