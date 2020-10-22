import React from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { ButtonGroup, CheckBox } from 'react-native-elements';

function checkbox(props: {
  name: string;
  checked: boolean;
  onCheck: () => void;
}) {
  return (
    <CheckBox
      key={props.name}
      title={props.name}
      textStyle={{ fontWeight: '400' }}
      checked={props.checked}
      containerStyle={{
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 0,
      }}
      iconType="feather"
      checkedIcon="check"
      uncheckedIcon="square"
      onPress={props.onCheck}
    />
  );
}

export default function SearchSettingModal(props: {
  visible: boolean;
  setSearchType: (val: string) => void;
  dismiss: () => void;
}) {
  const [checkedIndex, setCheckedIndex] = React.useState(0);
  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={props.dismiss}
      isVisible={props.visible}
      backdropOpacity={0.7}
    >
      <View style={styles.modal} pointerEvents="box-none">
        <Text style={styles.header}>Search by</Text>
        <View style={{ marginTop: '5%' }}>
          {[
            { name: 'Bill Title', value: 'title' },
            { name: 'Category', value: 'category' },
            { name: 'Bill Number', value: 'number' },
          ].map((val, i) => {
            return checkbox({
              name: val.name,
              checked: checkedIndex == i,
              onCheck: () => {
                setCheckedIndex(i);
                props.setSearchType(val.value);
              },
            });
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    position: 'absolute',
    top: '36.25%',
    left: '20%',
    width: '60%',
    height: '27.5%',
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOpacity: 1,
    shadowRadius: 200,
    borderRadius: 15,
    padding: '7.5%',
    paddingLeft: '10%',
  },
  header: {
    fontFamily: 'Futura',
    fontSize: 25,
  },
});
