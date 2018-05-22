import React, {Component} from 'react'
import { Grid, Row, FormGroup } from 'react-bootstrap'
import {sortBy} from 'lodash'

import {DEFAULT_QUERY, BASE_URL, SEARCH, PAGE_PARAM, PARAM_HPP, DEFAULT_HPP, QUERY, DEFAULT_PAGE} from './constants/index'

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse()
}

const withLoading = (Component) => (isLoading, ...rest) =>
  isLoading ? <Loading /> : <Component {...rest} />

const ButtonWithLoading = withLoading(Button)

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      result: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      isLoading: false,
      sortKey: 'NONE',
      isReverse: false
    }
    this.removeItem = this.removeItem.bind(this)
    this.searchValue = this.searchValue.bind(this)
    this.fetchTopStories = this.fetchTopStories.bind(this)
    this.setTopStories = this.setTopStories.bind(this)
    this.onSearchSubmit = this.onSearchSubmit.bind(this)
    this.onSort = this.onSort.bind(this)
  }

  onSort (sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isReverse
	this.state.isReverse = !this.state.isReverse
    this.setState({sortKey: sortKey, isSortReverse})
  }

  checktoStoriesSearchTerm (searchTerm) {
    return !this.state.results[searchTerm]
  }

  removeItem (id) {
    const {results, searchKey} = this.state
    const {hits, page} = results[searchKey]

    const updatedList = hits.filter(item => item.objectID !== id)
    this.setState({
      results: {...results, [searchKey]: {hits: updatedList, page}}})
  }

  searchValue (evt) {
    this.setState({searchTerm: evt.target.value})
  }

  setTopStories (result) {
    const {hits, page} = result

    const {results, searchKey} = this.state
    //  const oldHits = page !== 0 ? this.state.result.hits : []
    const oldHits = results && results[searchKey] ? results[searchKey].hits : []
    const updatedHits = [...oldHits, ...hits]
    this.setState({results: {...results, [searchKey]: {hits: updatedHits, page}}, isLoading: false})
  }

  fetchTopStories (searchTerm, page) {
    this.setState({isLoading: true})

    /* global fetch */
    fetch(`${BASE_URL}${SEARCH}?${PAGE_PARAM}${page}&${PARAM_HPP}${DEFAULT_HPP}&${QUERY}${searchTerm}`)
      .then(response => response.json())
      .then(result => this.setTopStories(result))
      .catch(e => e)
  }

  componentDidMount () {
    const {searchTerm} = this.state
    this.setState({searchKey: searchTerm})
    this.fetchTopStories(searchTerm, DEFAULT_PAGE)
  }

  onSearchSubmit (event) {
    const {searchTerm} = this.state
    this.setState({searchKey: searchTerm})

    if (this.checktoStoriesSearchTerm(searchTerm)) {
      this.fetchTopStories(searchTerm, DEFAULT_PAGE)
    }

    event.preventDefault()
  }

  render () {
    const {results, searchTerm, searchKey, isLoading, sortKey, isSortReverse} = this.state

    const page = (results && results[searchKey] && results[searchKey].page) || 0

    const list = (results && results[searchKey] && results[searchKey].hits) || []

    return (
      <div>
        <Grid fluid>
          <Row>
            <div className='jumbotron text-center'>
              <Search onChange={this.searchValue} value={searchTerm} onSubmit={this.onSearchSubmit}>
                Search
              </Search>
            </div>
          </Row>
        </Grid>
        <Grid>
          <hr />
          <Row style={{textAlign: 'center'}}>
            <Sort onSort={this.onSort} sortKey={'NONE'} activeSortKey={sortKey} > Default </Sort>
            <Sort onSort={this.onSort} sortKey={'AUTHOR'} activeSortKey={sortKey} > Author </Sort>
            <Sort onSort={this.onSort} sortKey={'TITLE'} activeSortKey={sortKey} > Title </Sort>
            <Sort onSort={this.onSort} sortKey={'POINTS'} activeSortKey={sortKey}> Points </Sort>
            <Sort onSort={this.onSort} sortKey={'COMMENTS'} activeSortKey={sortKey} > Comments </Sort>
          </Row>
          <hr />
          <Row>
            { results ?
              <Table sortKey={sortKey}
                isSortReverse={isSortReverse}
                result={list}
                removeItem={this.removeItem}
                searchTerm={searchTerm} /> : null
            }
            <div className='text-center alert'>

              <ButtonWithLoading className='btn btn-success'
                isLoading={isLoading}
                onClick={() => this.fetchTopStories(searchTerm, page + 1)}>
                Load More
              </ButtonWithLoading>

            </div>
          </Row>
        </Grid>
      </div>

    )
  }
}

class Table extends Component {
  render () {
    const {result, removeItem, sortKey, isSortReverse} = this.props
    let items = SORTS[sortKey](result)
    if (isSortReverse) {
      items = items.reverse()
    }
    return (
      <div className='col-sm-10 col-sm-offset-1'>
        {
          items.map(item =>
            <div key={item.objectID}>
              <h1> <a href={item.url}>{item.title}</a> by {item.author}</h1>
              <h4>{item.num_comments} Comments | {item.points} Points
                <Button className='btn btn-danger btn-xs' onClick={() => removeItem(item.objectID)} >Remove</Button>
              </h4>
              <hr />
            </div>
          )
      }
      </div>
    )
  }
}

class Button extends Component {
  render () {
    const {onClick, children, className} = this.props
    return <button type='button' className={className} onClick={onClick}>{children}</button>
  }
}

class Search extends Component {
  componentDidMount () {
    this.input.focus()
  }
  render () {
    const {onSubmit, onChange, value, children} = this.props
    return (

      <form onSubmit={onSubmit}>
        <FormGroup>
          <h1 style={{fontWeight: 'bold'}}>NEWSAPP</h1>
          <hr style={{ border: '2px solid black', width: '100px' }} />

          <div className='input-group'>
            <input className='form-control width100 searchForm' type='text' onChange={onChange} value={value}
              ref={(node) => { this.input = node }} />
            <span className='input-group-btn'>
              <button className='btn btn-primary searchBtn'>
                { children }
              </button>
            </span>
          </div>
        </FormGroup>
      </form>
    )
  }
}

class Sort extends Component {
  render () {
    const {children, onSort, activeSortKey, sortKey} = this.props
    const className = ['btn default']
    if (sortKey === activeSortKey) {
      className.push('btn btn-primary')
    }
    return (
      <Button
        className={className.join(' ')}
        onClick={() => onSort(sortKey)}>
        {children}
      </Button>
    )
  }
}

class Loading extends Component {
  render () {
    return <div>
      <h2>  Loading... </h2>
    </div>
  }
}

export default App
